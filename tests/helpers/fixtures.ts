import { test as base, expect, request as pwRequest } from "@playwright/test";
import type { APIRequestContext, Page, Response, TestInfo } from "@playwright/test";
import { createNewUser, type NewUser } from "./data";

type Session = { user: NewUser; token: string };
type Credentials = Pick<NewUser, "email" | "password">;


async function attachHttpErrorLogging(page: Page, testInfo: TestInfo) {
  const baseURL = testInfo.project.use!.baseURL as string;

  page.on("response", async (res: Response) => {
    if (!res.url().startsWith(baseURL)) return;
    if (res.status() < 400) return;

    console.error(`\n[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
  });
}

async function createApiContext(testInfo: TestInfo, extraHeaders: Record<string, string> = {}) {
  return pwRequest.newContext({
    baseURL: testInfo.project.use!.baseURL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

async function resolveCleanupToken(
  api: APIRequestContext,
  auth: string | Credentials
): Promise<string> {
  if (typeof auth === "string") return auth;

  const loginRes = await api.post("/users/login", {
    data: { email: auth.email, password: auth.password },
  });

  if (loginRes.status() !== 200) {
    throw new Error(
      `[cleanup] Failed to login cleanup user (${auth.email}). /users/login -> ${loginRes.status()}`
    );
  }

  const body = await loginRes.json().catch(() => ({}));
  if (!body?.token || typeof body.token !== "string") {
    throw new Error(`[cleanup] Cleanup login succeeded but token was missing for ${auth.email}.`);
  }

  return body.token;
}

export async function safeDeleteMe(api: APIRequestContext, auth: string | Credentials) {
  const token = await resolveCleanupToken(api, auth);
  const res = await api.delete("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (![200, 401, 404].includes(res.status())) {
    const body = await res.text().catch(() => "");
    console.warn(`[cleanup] WARN: DELETE /users/me -> ${res.status()} ${body}`);
  }
}

type Fixtures = {
  api: APIRequestContext;      // unauth API client
  session: Session;            // fresh user + token
  auth: APIRequestContext;     // authed API client
  authedPage: Page;            // UI page already logged in + lands on /contactList (app's landing page after login)
};

export const test = base.extend<Fixtures>({
  api: async ({ }, use, testInfo) => {
    const api = await createApiContext(testInfo);
    try {
      await use(api);
    } finally {
      await api.dispose();
    }
  },

  page: async ({ page }, use, testInfo) => {
    await attachHttpErrorLogging(page, testInfo);
    await use(page);
  },

  session: async ({ }, use, testInfo) => {
    const api = await createApiContext(testInfo);
    const user = createNewUser();

    const signupRes = await api.post("/users", { data: user });
    expect(signupRes.status()).toBe(201);

    const loginRes = await api.post("/users/login", {
      data: { email: user.email, password: user.password },
    });
    expect(loginRes.status()).toBe(200);

    const body = await loginRes.json();
    expect(body.token).toEqual(expect.any(String));

    const session: Session = { user, token: body.token };

    try {
      await use(session);
    } finally {
      try {
        await safeDeleteMe(api, session.token);
      } finally {
        await api.dispose();
      }
    }
  },

  auth: async ({ session }, use, testInfo) => {
    const auth = await createApiContext(testInfo, {
      Authorization: `Bearer ${session.token}`,
    });

    try {
      await use(auth);
    } finally {
      await auth.dispose();
    }
  },

  authedPage: async ({ page, session }, use, testInfo) => {
    const baseURL = testInfo.project.use!.baseURL as string;

    await page.context().addCookies([{ name: "token", value: session.token, url: baseURL }]);
    await page.goto("/contactList",);

    // explicit auth-expired failure message
    const res = await page.waitForResponse(
      (r) => r.request().method() === "GET" && r.url().endsWith("/contacts") && [200, 401].includes(r.status())
    );
    if (res.status() === 401) {
      throw new Error(
        [
          "Auth failed: GET /contacts returned 401 after setting cookie token.",
          "Likely causes:",
          "- token expired",
          "- app auth contract changed"
        ].join("\n")
      );
    }

    await use(page);
  },
});

export { expect };

import { test as base, expect, request as pwRequest } from "@playwright/test";
import type { APIRequestContext, Page, Response } from "@playwright/test";
import { BASE_URL, PAGE_TIMEOUT_MS } from "./constants";
import { createNewUser, type NewUser } from "./data";

type Session = { user: NewUser; token: string };
type Use<T> = (value: T) => Promise<void>;

async function attachHttpErrorLogging(page: Page) {
  page.on("response", async (res: Response) => {
    if (!res.url().startsWith(BASE_URL)) return;
    if (res.status() < 400) return;

    console.error(`\n[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
    try {
      console.error(await res.text());
    } catch (err) {
      console.warn("Failed to read response body", err);
    }
  });
}

async function createApiContext(extraHeaders: Record<string, string> = {}) {
  return await pwRequest.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

type Fixtures = {
  api: APIRequestContext;      // unauth API client
  session: Session;            // fresh user + token
  auth: APIRequestContext;     // authed API client
  authedPage: Page;            // UI page already logged in + lands on /contactList
};

export const test = base.extend<Fixtures>({
  api: async ({}, use: Use<APIRequestContext>) => {
    const api = await createApiContext();
    try {
      await use(api);
    } finally {
      await api.dispose();
    }
  },

  // Override page ONLY to attach logging (Lazy: only runs when page is used)
  page: async ({ page }, use: Use<Page>) => {
    await attachHttpErrorLogging(page);
    await use(page);
  },

  session: async ({ api }, use: Use<Session>) => {
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
      await api
        .delete("/users/me", { headers: { Authorization: `Bearer ${session.token}` } })
        .catch(() => {});
    }
  },

  auth: async ({ session }, use: Use<APIRequestContext>) => {
    const auth = await createApiContext({
      Authorization: `Bearer ${session.token}`,
    });

    try {
      await use(auth);
    } finally {
      await auth.dispose();
    }
  },

  authedPage: async ({ page, session }, use: Use<Page>) => {
    await page.context().addCookies([
      { name: "token", value: session.token, url: BASE_URL },
    ]);

    await page.goto(`${BASE_URL}/contactList`, { timeout: PAGE_TIMEOUT_MS });
    await use(page);
  },
});

export { expect };

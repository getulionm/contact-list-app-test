import { test as base, expect, request as pwRequest } from "@playwright/test";
import type { Page, Response, TestInfo } from "@playwright/test";
import fs from "node:fs";

import { createNewUser, type NewUser } from "./data";
import { attachApiErrorLogging } from "./apiLogging";
import type { ApiClient } from "./apiLogging";

type Session = { user: NewUser; token: string };
type Use<T> = (value: T) => Promise<void>;

function mustBaseURL(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use?.baseURL;
  if (!baseURL || typeof baseURL !== "string") {
    throw new Error("baseURL is not set. Define `use.baseURL` in playwright.config.ts");
  }
  return baseURL.replace(/\/$/, "");
}

async function attachPageErrorLogging(page: Page, testInfo: TestInfo) {
  const baseURL = mustBaseURL(testInfo);

  page.on("response", async (res: Response) => {
    if (!res.url().startsWith(baseURL)) return;
    if (res.status() < 400) return;

    console.error(`\n[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
    try {
      console.error(await res.text());
    } catch (err) {
      console.warn("Failed to read response body", err);
    }
  });
}

async function newApiContext(testInfo: TestInfo, extraHeaders: Record<string, string> = {}) {
  const baseURL = mustBaseURL(testInfo);
  return await pwRequest.newContext({
    baseURL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

type Fixtures = {
  api: ApiClient;        // unauth API client
  session: Session;      // fresh user + token
  auth: ApiClient;       // authed API client (Bearer)
  authedPage: Page;      // uses storageState .auth/state.json and lands on /contactList
};

export const test = base.extend<Fixtures>({
  api: async ({ }, use: Use<ApiClient>, testInfo) => {
    const ctx = await newApiContext(testInfo);
    const api = await attachApiErrorLogging(ctx);
    try {
      await use(api);
    } finally {
      await ctx.dispose();
    }
  },

  page: async ({ page }, use: Use<Page>, testInfo) => {
    await attachPageErrorLogging(page, testInfo);
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
        .catch(() => { });
    }
  },

  auth: async ({ session }, use: Use<ApiClient>, testInfo) => {
    const ctx = await newApiContext(testInfo, {
      Authorization: `Bearer ${session.token}`,
    });

    const auth = await attachApiErrorLogging(ctx);

    try {
      await use(auth);
    } finally {
      await ctx.dispose();
    }
  },

  authedPage: async ({ browser }, use: Use<Page>, testInfo) => {
    const baseURL = mustBaseURL(testInfo);

    if (!fs.existsSync(".auth/state.json")) {
      throw new Error("Missing .auth/state.json. Setup didn’t run or failed.");
    }

    const context = await browser.newContext({
      baseURL,
      storageState: ".auth/state.json",
    });

    const page = await context.newPage();
    await attachPageErrorLogging(page, testInfo);

    await page.goto("/contactList");
    await use(page);

    await context.close();
  }
});

export { expect };
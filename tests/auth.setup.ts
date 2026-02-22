import { test as setup, expect, request as pwRequest } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createNewUser } from "./helpers/data";

setup("authenticate", async ({ browser }, testInfo) => {
  fs.mkdirSync(".auth", { recursive: true });

  const baseURL = testInfo.project.use?.baseURL;
  if (!baseURL || typeof baseURL !== "string") throw new Error("Missing baseURL");

  const user = createNewUser();
  const api = await pwRequest.newContext({ baseURL });

  const signup = await api.post("/users", { data: user });
  expect(signup.status()).toBe(201);

  const loginRes = await api.post("/users/login", {
    data: { email: user.email, password: user.password },
  });
  expect(loginRes.status()).toBe(200);

  const { token } = await loginRes.json();

  // ✅ Persist info needed for cleanup later
  fs.writeFileSync(
    path.join(".auth", "meta.json"),
    JSON.stringify({ token, email: user.email }, null, 2),
    "utf-8"
  );

  await api.dispose();

  // Cookie-based UI auth -> storageState
  const context = await browser.newContext({ baseURL });
  await context.addCookies([{ name: "token", value: token, url: baseURL }]);

  const page = await context.newPage();
  const contacts200 = page.waitForResponse((res) =>
    res.request().method() === "GET" && res.url().endsWith("/contacts") && res.status() === 200
  );

  await page.goto("/contactList");
  await contacts200;

  await context.storageState({ path: ".auth/state.json" });
  await context.close();
});
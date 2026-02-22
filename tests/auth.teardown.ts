import { test as teardown, expect, request as pwRequest } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

teardown("cleanup setup user", async ({}, testInfo) => {
  const baseURL = testInfo.project.use?.baseURL;
  if (!baseURL || typeof baseURL !== "string") throw new Error("Missing baseURL");

  const metaPath = path.join(".auth", "meta.json");
  if (!fs.existsSync(metaPath)) return;

  const { token } = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as { token?: string };
  if (!token) return;

  const api = await pwRequest.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });

  const res = await api.delete("/users/me");
  expect([200, 401]).toContain(res.status()); // 401 if already deleted / expired; optional
  await api.dispose();
});
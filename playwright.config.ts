import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL ?? "https://thinking-tester-contact-list.herokuapp.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      teardown: "teardown",
    },
    {
      name: "teardown",
      testMatch: /.*\.teardown\.ts/,
    },
  ],
});
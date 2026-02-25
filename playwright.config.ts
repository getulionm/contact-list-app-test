import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "https://thinking-tester-contact-list.herokuapp.com",
    extraHTTPHeaders: { "Content-Type": "application/json" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "integration",
      grep: /@api/,
    },
    {
      name: "e2e-chromium",
      grep: /@ui/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e-firefox",
      grep: /@ui/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "e2e-webkit",
      grep: /@ui/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
});

import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 20000,
    expect: {
        timeout: 5000,
    },
    use: {
        baseURL: "https://thinking-tester-contact-list.herokuapp.com",
        extraHTTPHeaders: {
            "Content-Type": "application/json",
        },
    },
    reporter: [["list"], ['html', { open: 'never' }]],
});

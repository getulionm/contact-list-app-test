import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    use: {
        baseURL: "https://thinking-tester-contact-list.herokuapp.com",
        extraHTTPHeaders: {
            "Content-Type": "application/json",
        },
    },
    reporter: [["list"], ['html', { open: 'never' }]],
});

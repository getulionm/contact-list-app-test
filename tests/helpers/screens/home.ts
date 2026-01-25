import type { Page } from "@playwright/test";
import { clickAndNavigate } from "../ui";

export async function goToSignup(page: Page) {
  await clickAndNavigate(page, "#signup", /\/addUser/);
}

export async function login(page: Page, email: string, password: string) {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await clickAndNavigate(page, "#submit", /\/contactList/);
}

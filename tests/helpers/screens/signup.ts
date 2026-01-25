import type { Page } from "@playwright/test";
import { clickAndNavigate } from "../ui";
import type { NewUser } from "../data";

const selectors = {
  firstName: "#firstName",
  lastName: "#lastName",
  email: "#email",
  password: "#password",
  submit: "#submit",
};

export async function registerUser(page: Page, user: NewUser) {
  await page.locator(selectors.firstName).fill(user.firstName);
  await page.locator(selectors.lastName).fill(user.lastName);
  await page.locator(selectors.email).fill(user.email);
  await page.locator(selectors.password).fill(user.password);

  await clickAndNavigate(page, selectors.submit, /\/contactList/);
}

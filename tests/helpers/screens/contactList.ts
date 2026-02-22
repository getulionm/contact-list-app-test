import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { clickAndNavigate } from "../ui";

const selectors = {
  heading: { role: "heading" as const, name: "Contact List" },
  logout: "#logout",
  addContact: "#add-contact",
  table: "table.contactTable",
  row: "tr.contactTableBodyRow",
};

export function getContactRow(page: Page, fullName: string) {
  return page.locator(selectors.row).filter({ hasText: fullName });
}

export async function openContactDetailsFromList(page: Page, fullName: string) {
  const row = getContactRow(page, fullName);
  await expect(row).toBeVisible();
  await clickAndNavigate(page, row, /\/contactDetails/);
}

export async function expectContactListLoaded(page: Page) {
  await expect(
    page.getByRole(selectors.heading.role, { name: selectors.heading.name })
  ).toBeVisible();

  await expect(page.locator(selectors.logout)).toBeVisible();
  await expect(page.locator(selectors.addContact)).toBeVisible();
  await expect(page.locator(selectors.table)).toBeVisible();
}

export async function goToAddContact(page: Page) {
  await clickAndNavigate(page, selectors.addContact, /\/addContact/);
}

export async function logout(page: Page) {
  await clickAndNavigate(page, "#logout", /\/$/);
}

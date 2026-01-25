import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { clickAndNavigate } from "../ui";
import { PAGE_TIMEOUT_MS } from "../constants";

const selectors = {
  editContact: "button#edit-contact",
  returnToList: "#return",
  heading: { role: "heading" as const, name: "Contact Details" }
};

export async function goToEditContact(page: Page) {
  await clickAndNavigate(page, selectors.editContact, /\/editContact/);
  await expect(page.locator("form#edit-contact")).toBeVisible({ timeout: PAGE_TIMEOUT_MS });
}

export async function returnToContactList(page: Page) {
  await clickAndNavigate(page, selectors.returnToList, /\/contactList/);
}

export async function expectContactDetailsLoaded(page: Page) {
  await expect(
    page.getByRole(selectors.heading.role, { name: selectors.heading.name })
  ).toBeVisible({ timeout: PAGE_TIMEOUT_MS });
}

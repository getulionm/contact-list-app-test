import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { clickAndNavigate } from "../ui";

const selectors = {
  form: "form#edit-contact",
  firstName: "#firstName",
  lastName: "#lastName",
  birthdate: "#birthdate",
  email: "#email",
  phone: "#phone",
  street1: "#street1",
  street2: "#street2",
  city: "#city",
  stateProvince: "#stateProvince",
  postalCode: "#postalCode",
  country: "#country",
  submit: "#submit",
};

export async function expectEditContactPrefilledMinimal(page: Page, initial: { firstName: string; lastName: string }) {
  await expect(page.locator(selectors.form)).toBeVisible();

  await expect(page.locator(selectors.firstName)).toHaveValue(initial.firstName);
  await expect(page.locator(selectors.lastName)).toHaveValue(initial.lastName);

  // empty optional fields in your scenario
  await expect(page.locator(selectors.birthdate)).toHaveValue("");
  await expect(page.locator(selectors.email)).toHaveValue("");
  await expect(page.locator(selectors.phone)).toHaveValue("");
  await expect(page.locator(selectors.street1)).toHaveValue("");
  await expect(page.locator(selectors.street2)).toHaveValue("");
  await expect(page.locator(selectors.city)).toHaveValue("");
  await expect(page.locator(selectors.stateProvince)).toHaveValue("");
  await expect(page.locator(selectors.postalCode)).toHaveValue("");
  await expect(page.locator(selectors.country)).toHaveValue("");
}

export async function submitEditBackToDetails(page: Page) {
  await clickAndNavigate(page, selectors.submit, /\/contactDetails/);

  // your test asserts heading visible after submit; keep that in the details helper
}

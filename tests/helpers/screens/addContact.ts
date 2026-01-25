import type { Page } from "@playwright/test";
import { clickAndNavigate } from "../ui";
import type { MinimalContact, FullContact } from "../data";

const selectors = {
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

export async function fillContactMinimalFields(page: Page, contact: MinimalContact) {
    await page.locator(selectors.firstName).fill(contact.firstName);
    await page.locator(selectors.lastName).fill(contact.lastName);
}

export async function fillContactAllFields(page: Page, contact: FullContact) {
    await fillContactMinimalFields(page, contact);

    await page.locator(selectors.birthdate).fill(contact.birthdate);
    await page.locator(selectors.email).fill(contact.email);
    await page.locator(selectors.phone).fill(contact.phone);
    await page.locator(selectors.street1).fill(contact.street1);
    await page.locator(selectors.street2).fill(contact.street2);
    await page.locator(selectors.city).fill(contact.city);
    await page.locator(selectors.stateProvince).fill(contact.stateProvince);
    await page.locator(selectors.postalCode).fill(contact.postalCode);
    await page.locator(selectors.country).fill(contact.country);
}

export async function submitContact(page: Page) {
    await clickAndNavigate(page, selectors.submit, /\/contactList/);
}

import { test, expect } from "./helpers/fixtures";
import {
    createNewUser,
    createFullContact,
    createMinimalContact,
} from "./helpers/data";


import { goToSignup, login } from "./helpers/screens/home";
import { registerUser } from "./helpers/screens/signup";
import { fillContactMinimalFields, submitContact, fillContactAllFields } from "./helpers/screens/addContact";
import {
    goToAddContact,
    expectContactListLoaded,
    getContactRow,
    openContactDetailsFromList, logout
} from "./helpers/screens/contactList";
import { expectContactDetailsLoaded, goToEditContact, returnToContactList } from "./helpers/screens/contactDetails";
import { expectEditContactPrefilledMinimal, submitEditBackToDetails } from "./helpers/screens/editContact";

// 1. User Registration
// ○ Navigate to the registration page.
// ○ Register a new user with valid credentials.
// ○ Verify successful registration by doing login.
test("1) User can register, logout, and log back in", async ({ page }) => {
    const user = createNewUser();

    await page.goto("/");

    await goToSignup(page);
    await registerUser(page, user);
    await expectContactListLoaded(page);

    await logout(page);

    await login(page, user.email, user.password);
    await expectContactListLoaded(page);
});

// 2. Create a New Contact
// ○ While logged in, create a new contact with valid data.
// ○ Verify that the new contact appears in the contact list.
test.describe("2) User can create a new contact", () => {
    test("with minimal fields", async ({ authedPage: page }) => {
        const contact = createMinimalContact();
        await expectContactListLoaded(page);

        await goToAddContact(page);

        await fillContactMinimalFields(page, contact);
        await submitContact(page);

        await expectContactListLoaded(page);

        const fullName = `${contact.firstName} ${contact.lastName}`;
        const row = getContactRow(page, fullName);
        await expect(row).toBeVisible();
    });

    test("with all fields", async ({ authedPage: page }) => {
        const contact = createFullContact();
        await expectContactListLoaded(page);

        await goToAddContact(page);

        await fillContactAllFields(page, contact);
        await submitContact(page);

        await expectContactListLoaded(page);

        const fullName = `${contact.firstName} ${contact.lastName}`;
        const row = getContactRow(page, fullName);

        await expect(row).toBeVisible();
        await expect(row).toContainText(contact.email);
        await expect(row).toContainText(contact.phone);
        await expect(row).toContainText(contact.city);
        await expect(row).toContainText(contact.stateProvince);
        await expect(row).toContainText(contact.postalCode);
        await expect(row).toContainText(contact.country);
    });
});

// 3. Edit an Existing Contact
// ○ Update details of an existing contact.
// ○ Verify that the changes are reflected in the contact list.
test("3) User can edit an existing contact and see updates in the list", async ({ authedPage: page }) => {
    const initialContact = createMinimalContact();
    const initialFullName = `${initialContact.firstName} ${initialContact.lastName}`;

    const updatedContact = createFullContact();
    const updatedFullName = `${updatedContact.firstName} ${updatedContact.lastName}`;

    await expectContactListLoaded(page);

    await goToAddContact(page);
    await fillContactMinimalFields(page, initialContact);
    await submitContact(page);
    await expectContactListLoaded(page);

    await openContactDetailsFromList(page, initialFullName);

    await goToEditContact(page);
    await expectEditContactPrefilledMinimal(page, initialContact);

    await fillContactAllFields(page, updatedContact);

    await submitEditBackToDetails(page);
    await expectContactDetailsLoaded(page);

    await returnToContactList(page);
    await expectContactListLoaded(page);

    const row = getContactRow(page, updatedFullName);
    await expect(row).toBeVisible();
    await expect(row).toContainText(updatedContact.firstName);
    await expect(row).toContainText(updatedContact.lastName);
    await expect(row).toContainText(updatedContact.birthdate);
    await expect(row).toContainText(updatedContact.email);
    await expect(row).toContainText(updatedContact.phone);
    await expect(row).toContainText(updatedContact.city);
    await expect(row).toContainText(updatedContact.stateProvince);
    await expect(row).toContainText(updatedContact.postalCode);
    await expect(row).toContainText(updatedContact.country);
});
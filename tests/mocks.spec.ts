import { test, expect } from "./helpers/fixtures";
import { expectContactListLoaded, getContactRow } from "./helpers/screens/contactList";

test("Advanced: mocks GET /contacts and asserts UI renders deterministic data", async ({ page }) => {
    const mockedContacts = [
        {
            _id: "c1",
            firstName: "Ada",
            lastName: "Lovelace",
            birthdate: "1815-12-10",
            email: "ada@mock.com",
            phone: "07111111111",
            street1: "1 Mock St",
            street2: "",
            city: "London",
            stateProvince: "Sutton",
            postalCode: "SM2 5TD",
            country: "UK",
            owner: "mock@owner.com" // unexisting field
        },
        {
            _id: "c2",
            firstName: "Alan",
            lastName: "Turing",
            birthdate: "1912-06-23",
            email: "alan@mock.com",
            phone: "07222222222",
            street1: "2 Mock St",
            street2: "",
            city: "Manchester",
            stateProvince: "Lancashire",
            postalCode: "M1 1AA",
            country: "UK",
            owner: "mock@owner.com" // unexisting field
        },
    ];

    let intercepted = false;

    await page.route("**/contacts", async (route) => {
        if (route.request().method() !== "GET") return route.fallback();
        intercepted = true;

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockedContacts),
            headers: {
                "cache-control": "no-store",
            },
        });
    });

    // ✅ Network determinism proof: wait for the exact GET /contacts response
    const contactsResponsePromise = page.waitForResponse((res) => {
        if (res.request().method() !== "GET") return false;
        return res.url().endsWith("/contacts") && res.status() === 200;
    });

    await page.goto("/contactList");

    const contactsRes = await contactsResponsePromise;

    // ✅ Hard proof: response body == mocked payload
    const body = await contactsRes.json();
    expect(body).toEqual(mockedContacts);

    await expectContactListLoaded(page);

    for (const c of mockedContacts) {
        const row = getContactRow(page, `${c.firstName} ${c.lastName}`);
        await expect(row).toBeVisible();
        await expect(row).toContainText(c.email);
        await expect(row).toContainText(c.phone);
        await expect(row).toContainText(c.city);
        await expect(row).toContainText(c.stateProvince);
        await expect(row).toContainText(c.postalCode);
        await expect(row).toContainText(c.country);
    }

    expect(intercepted).toBe(true);
});
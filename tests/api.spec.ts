import { test, expect } from "./helpers/fixtures";
import { createNewUser, createFullContact } from "./helpers/data";

// 1. User Authentication via API
// ○ Use the API to authenticate with the credentials of the registered
// user.
// ○ Verify that a valid token or session is returned.
test("1) User Authentication via API returns token", async ({ api }) => {
    const user = createNewUser();
    const signupRes = await api.post("/users", { data: user });
    expect(signupRes.status()).toBe(201);

    const loginRes = await api.post("/users/login", {
        data: { email: user.email, password: user.password },
    });
    expect(loginRes.status()).toBe(200);

    const body = await loginRes.json();
    expect(body).toEqual(
        expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({ email: user.email }),
        })
    );

    const delUserRes = await api.delete("/users/me", {
        headers: { Authorization: `Bearer ${body.token}` },
    });
    expect(delUserRes.status()).toBe(200);
});

// ○ Use the API to create a new contact with valid data.
// ○ Verify that the contact is created by retrieving it via the API and
// checking its presence in the response.
test("2) Create Contact via API and verify via GET /contacts/:id", async ({ auth }) => {
    const contact = createFullContact();
    const createRes = await auth.post("/contacts", { data: contact });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();

    const getRes = await auth.get(`/contacts/${created._id}`);
    expect(getRes.status()).toBe(200);

    const fetched = await getRes.json();
    expect(fetched).toEqual(
        expect.objectContaining({
            _id: created._id,
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
        })
    );

    const delRes = await auth.delete(`/contacts/${created._id}`);
    expect(delRes.status()).toBe(200);
});

// 3. Delete a Contact via API
// ○ Use the API to delete a contact.
// ○ Verify that the contact is removed by checking the API response.
test("3) Delete Contact via API and verify removed", async ({ auth }) => {
    const contact = createFullContact();
    const createRes = await auth.post("/contacts", { data: contact });
    expect(createRes.status()).toBe(201);

    const created = await createRes.json();
    const delRes = await auth.delete(`/contacts/${created._id}`);
    expect(delRes.status()).toBe(200);
    const delBody = await delRes.text();
    expect(delBody).toContain("Contact deleted");
});

// EXTEND ON DEMAND
test('login fails with wrong password', async ({ api, session }) => {
    const loginRes = await api.post('users/login', {
        data: { email: session.user.email, password: 'INCORRECT PASSWORD!!!!!' }
    })
    expect(loginRes.status()).toBe(401)
})
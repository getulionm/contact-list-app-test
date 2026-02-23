import { test, expect } from "./helpers/fixtures";
import { createNewUser, createFullContact } from "./helpers/data";

test("Auth: returns token and authorizes protected request", async ({ api }) => {
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

test("Contacts: delete returns success message", async ({ auth }) => {
    const contact = createFullContact();
    const createRes = await auth.post("/contacts", { data: contact });
    expect(createRes.status()).toBe(201);

    const created = await createRes.json();
    expect(created).toEqual(expect.objectContaining({ _id: expect.any(String) }));
    const delRes = await auth.delete(`/contacts/${created._id}`);
    expect(delRes.status()).toBe(200);
    const delBody = await delRes.text();
    expect(delBody).toContain("Contact deleted");
});

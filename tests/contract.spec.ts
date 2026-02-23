import { test, expect } from "./helpers/fixtures";
import { createFullContact } from "./helpers/data";

type Contact = {
    _id: string;
    firstName: string;
    lastName: string;
    birthdate: string;
    email: string;
    phone: string;
    street1: string;
    street2: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    owner: string;
};

const objectIdLike = /^[a-f0-9]{24}$/i;
const birthdateFormat = /^\d{4}-\d{2}-\d{2}$/;

function expectContactContract(contact: unknown): asserts contact is Contact {
    expect(contact).toEqual(
        expect.objectContaining({
            _id: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            birthdate: expect.any(String),
            email: expect.any(String),
            phone: expect.any(String),
            street1: expect.any(String),
            street2: expect.any(String),
            city: expect.any(String),
            stateProvince: expect.any(String),
            postalCode: expect.any(String),
            country: expect.any(String),
            owner: expect.any(String),
        })
    );

    const c = contact as Contact;
    expect(c._id).toMatch(objectIdLike);
    expect(c.owner).toMatch(objectIdLike);
    expect(c.birthdate).toMatch(birthdateFormat);
}

test.describe("API contract + auth boundaries", () => {
    test("returns 401 when contacts endpoint is called without auth", async ({ api }) => {
        const res = await api.get("/contacts");
        expect(res.status()).toBe(401);
    });

    test("created contact matches contract and can be fetched by id", async ({ auth }) => {
        const payload = createFullContact();

        const meRes = await auth.get("/users/me");
        expect(meRes.status()).toBe(200);
        const me = await meRes.json();
        expect(me?._id).toMatch(objectIdLike);

        const createRes = await auth.post("/contacts", { data: payload });
        expect(createRes.status()).toBe(201);

        const created = await createRes.json();
        expectContactContract(created);
        expect(created.owner).toBe(me._id);

        const getRes = await auth.get(`/contacts/${created._id}`);
        expect(getRes.status()).toBe(200);

        const fetched = await getRes.json();
        expectContactContract(fetched);
        expect(fetched.owner).toBe(me._id);

        expect(fetched).toEqual(
            expect.objectContaining({
                _id: created._id,
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
            })
        );

        const deleteRes = await auth.delete(`/contacts/${created._id}`);
        expect(deleteRes.status()).toBe(200);
    });
});
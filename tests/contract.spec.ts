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
    __v?: number;
};

const objectIdLike = /^[a-f0-9]{24}$/i;
const birthdateFormat = /^\d{4}[-/]\d{2}[-/]\d{2}$/;

function expectContactContract(contact: unknown) {
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

    const typed = contact as Contact;
    expect(typed._id).toMatch(objectIdLike);
    expect(typed.owner).toMatch(objectIdLike);
    expect(typed.birthdate).toMatch(birthdateFormat);

    if (typed.__v !== undefined) {
        expect(typed.__v).toEqual(expect.any(Number));
    }
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
        expect(me?._id).toEqual(expect.any(String));

        const createRes = await auth.post("/contacts", { data: payload });
        expect(createRes.status()).toBe(201);

        const created = (await createRes.json()) as Contact;
        expectContactContract(created);

        const getRes = await auth.get(`/contacts/${created._id}`);
        expect(getRes.status()).toBe(200);

        const fetched = await getRes.json();
        expectContactContract(fetched);

        await expect(fetched).toEqual(
            expect.objectContaining({
                _id: created._id,
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                owner: me._id,
            })
        );

        const deleteRes = await auth.delete(`/contacts/${created._id}`);
        expect(deleteRes.status()).toBe(200);
    });
});

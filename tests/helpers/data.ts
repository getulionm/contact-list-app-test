function slug() {
  return Math.random().toString(36).slice(2, 8);
}

export type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function createNewUser(overrides: Partial<NewUser> = {}): NewUser {
  const s = slug();
  return {
    firstName: `FirstName+${s}`,
    lastName: `LastName+${s}`,
    email: `mail+${s}@mail.com`,
    password: `${s}!`,
    ...overrides,
  };
}

export type MinimalContact = {
  firstName: string;
  lastName: string;
};

export type FullContact = MinimalContact & {
  birthdate: string;
  email: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};


// UI-friendly: only required fields by default
export function createMinimalContact(
  overrides: Partial<MinimalContact> = {}
): MinimalContact {
  const s = slug();

  return {
    firstName: `FirstName-${s}`,
    lastName: `LastName-${s}`,
    ...overrides,
  };
}

// API-friendly: full valid payload by default
export function createFullContact(
  overrides: Partial<FullContact> = {}
): FullContact {
  const s = slug();
  return {
    firstName: `FirstName-${s}`,
    lastName: `LastName-${s}`,
    birthdate: "1950-01-01",
    email: `test+${s}@mail.com`,
    phone: "07542632999",
    street1: "1 Albion Road",
    street2: "Flat 2",
    city: "London",
    stateProvince: "Sutton",
    postalCode: "SM2 5TD",
    country: "UK",
    ...overrides,
  };
}

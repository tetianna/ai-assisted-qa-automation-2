import { faker } from '@faker-js/faker';

export type ProgramInput = {
  name: string;
  description: string;
};

/** Happy-path program payload. Unique name so parallel runs cannot collide. */
export function programFactory(overrides: Partial<ProgramInput> = {}): ProgramInput {
  return {
    name: `${faker.commerce.department()} ${Date.now()}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}

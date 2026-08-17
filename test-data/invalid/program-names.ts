/** Curated invalid program names — do not generate these with Faker. */
export const invalidProgramNames = {
  empty: '',
  whitespace: '   ',
  tooLong: 'A'.repeat(256),
} as const;

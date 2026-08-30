/**
 * Test data for the prescription consultation flow.
 *
 * These are the values the test environment is seeded with. The details of the
 * drug actually chosen (substance, strength, packaging) are read from the
 * selected suggestion at runtime, so only the fixed values live here.
 */

export const MEDICINE = {
  /** Search term typed into the "Wpisz nazwę leku" field. */
  searchName: 'Normaclin',
  /** Number of suggestions the search returns for `searchName`. */
  expectedSuggestions: 6,
  /** Quantity shown on the consultation summary. */
  quantity: '1 szt.',
  price: '59.00',
  currency: 'PLN',
} as const;

/** Price with its currency, e.g. "59.00 PLN". */
export const MEDICINE_PRICE_WITH_CURRENCY = `${MEDICINE.price} ${MEDICINE.currency}`;

export const DOCTOR = {
  /** Rendered by the application with the honorific twice — "lek. lek.". */
  name: 'lek. lek. Michał Stach',
  description: 'Lekarz ogólny - konsultacja z receptą',
  assignInfo:
    '*Ten lekarz zostanie przypisany do Twojej wizyty dopiero gdy dokonasz rezerwacji. Nie zwlekaj więc.',
  ratingStars: 5,
} as const;

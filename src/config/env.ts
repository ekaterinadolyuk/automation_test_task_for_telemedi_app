import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill in the test credentials.`,
    );
  }
  return value;
}

/** Base URL of the application under test. */
export const BASE_URL = process.env.TM_BASE_URL ?? 'https://testyautomatyczne.telemedi.com';

/** Credentials of the shared test patient account. */
export const USER_EMAIL = required('TM_EMAIL');
export const USER_PASSWORD = required('TM_PASSWORD');

/** Personal data of the test patient, as displayed by the application. */
export const PATIENT_NAME = required('TM_PATIENT_NAME');
export const PATIENT_PESEL = required('TM_PATIENT_PESEL');
export const PATIENT_BIRTH_DATE = required('TM_PATIENT_BIRTH_DATE');

/** Where the authenticated session is stored by the `login` project. */
export const STORAGE_STATE = path.resolve(__dirname, '../../playwright/.auth/user.json');

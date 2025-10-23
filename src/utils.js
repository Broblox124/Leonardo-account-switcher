import fs from 'fs';

export function loadAccounts() {
  const envData = process.env.LEONARDO_ACCOUNTS; // get JSON string
  if (!envData) throw new Error('Missing LEONARDO_ACCOUNTS environment variable');
  return JSON.parse(envData);
}

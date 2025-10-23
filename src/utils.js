import fs from 'fs';

export function loadAccounts() {
  const raw = fs.readFileSync('./accounts.json', 'utf-8');
  return JSON.parse(raw);
}
// src/services/data.service.js
import fs from 'fs-extra';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function readDB() {
  const raw = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeDB(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

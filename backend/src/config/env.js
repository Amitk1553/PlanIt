import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'GEMINI_API_KEY',
  'PORT',
  'FIRECRAWL_API_KEY',
];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  port: Number(process.env.PORT) || 4000,
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
};

import { env } from '../config/env.js';

const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v2/scrape';

const parseFirecrawlResponse = async (response) => {
  const rawText = await response.text();

  let payload;
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    throw new Error(`Firecrawl returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  if (!response.ok || payload?.success === false) {
    const reason = payload?.error || payload?.message || rawText;
    throw new Error(`Firecrawl scrape failed (${response.status}): ${reason}`);
  }

  return payload?.data ?? {};
};

export const firecrawlService = {
  async scrapeJson({ url, schema, prompt, location, maxAge = 0, storeInCache = false }) {
    if (!url) {
      throw new Error('Firecrawl requires a target URL.');
    }

    const formats = [
      {
        type: 'json',
        ...(schema ? { schema } : {}),
        ...(prompt ? { prompt } : {}),
      },
    ];

    const body = {
      url,
      formats,
      maxAge,
      storeInCache,
    };

    if (location) {
      body.location = location;
    }

    const response = await fetch(FIRECRAWL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.firecrawlApiKey}`,
      },
      body: JSON.stringify({
        ...body,
        onlyMainContent: true,
        maxAge,
        headers: {},
        waitFor: 0,
        mobile: false,
        skipTlsVerification: false,
        timeout: 60000,
        parsers: [],
        actions: [],
        location: location || { country: 'IN', languages: ['en'] },
        removeBase64Images: true,
        blockAds: true,
        proxy: 'auto',
        storeInCache,
        zeroDataRetention: false,
      }),
    });

    const data = await parseFirecrawlResponse(response);
    return data?.json ?? data;
  },
};

import { callGeminiJson } from './gemini.helper.js';
import { formatEventDate } from '../utils/date.util.js';

const webSearchSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    findings: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          url: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['title', 'description'],
      },
    },
  },
  required: ['findings'],
};

export const callWebSearchAgent = async ({ prompt, location, eventDate }) => {
  const locationLabel = location?.city
    ? `${location.city}, ${location.state || ''} ${location.country || ''}`.trim()
    : 'the specified destination';
  const prettyEventDate = formatEventDate(eventDate);
  const eventDateLabel = prettyEventDate || 'a relevant upcoming date';
  const composedQuery = [prompt, location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(' | ');

  const userPrompt = [
    `User request: ${prompt}`,
    `Destination: ${locationLabel}`,
    `Event date: ${eventDateLabel}`,
    'Surface 3 timely happenings, venues, or tips that match the request. '
      + 'Cite credible sources and include URLs when known. '
      + 'Only include verifiable facts; do not fabricate data.',
  ].join('\n');

  const insight = await callGeminiJson({
    systemPrompt:
      'You are a live discovery assistant. Summarize actionable findings in JSON, prioritizing accuracy and recent context.',
    userPrompt,
    schema: webSearchSchema,
    model: 'gemini-3.1-pro-preview',
    temperature: 0.4,
  });

  const results = (insight.findings || []).slice(0, 3).map((item) => ({
    title: item.title || 'Relevant highlight',
    snippet: item.description || item.summary || '',
    link: item.url || '',
    source: item.source || 'Gemini knowledge',
  }));

  return {
    agent: 'web_search',
    data: {
      location,
      eventDate: eventDate || null,
      eventDateLabel: prettyEventDate || null,
      query: composedQuery || prompt,
      summary: insight.summary || insight.raw || 'Summary unavailable.',
      results,
      fetchedAt: new Date().toISOString(),
      source: 'Gemini 3.1 Pro Preview',
    },
  };
};

import { gemini } from '../config/gemini.js';

export const CONTROLLED_LOCATION_PROMPT = `Please select your destination using the following structure:
- Country (dropdown list)
- State/Region (filtered by country)
- City (filtered by state)
Reply in the form "Country: <value> | State: <value> | City: <value>" (example: Country: India | State: Jharkhand | City: Jamshedpur).
Do not proceed until all three values are confirmed.`;

const plannerSchema = {
  type: 'object',
  properties: {
    location: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        state: { type: 'string' },
        city: { type: 'string' },
      },
      required: ['country', 'state', 'city'],
    },
    subtasks: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
        enum: ['movie', 'restaurant', 'weather', 'web_search'],
      },
    },
  },
  required: ['location', 'subtasks'],
};

const buildSystemPrompt = (locationOverride) => {
  let prompt =
    'You are an orchestration planner. Determine the exact destination (country, state, city) and which agent subtasks (movie, restaurant, weather, web_search) are needed to fulfill the request. Always output JSON that matches the provided schema.';

  if (locationOverride) {
    prompt += `\nUse this exact destination without modification: Country: ${locationOverride.country}; State: ${locationOverride.state}; City: ${locationOverride.city}.`;
  }

  prompt +=
    '\nOnly include subtasks that are explicitly needed. If the user only requested one thing, return an array with that single agent.';

  return prompt;
};

export const plannerService = {
  async extractPlan({ prompt, locationOverride }) {
    const model = gemini.getGenerativeModel({
      model: 'gemini-3.1-pro-preview',
      systemInstruction: buildSystemPrompt(locationOverride),
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: plannerSchema,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response?.text();

    if (!text) {
      throw new Error('Planner did not return structured arguments.');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      const parsingError = new Error('Planner response could not be parsed.');
      parsingError.cause = error;
      throw parsingError;
    }

    const location = locationOverride ?? parsed.location;

    if (!location?.country || !location?.state || !location?.city) {
      throw new Error('Location is incomplete. Ensure country, state, and city are provided.');
    }

    return {
      location,
      subtasks: parsed.subtasks,
    };
  },
};

import { callGeminiJson } from './gemini.helper.js';
import { formatEventDate } from '../utils/date.util.js';
import { fetchRestaurants } from '../integrations/zomato/restaurants.js';
import { formatLocationLabel } from '../integrations/zomato/utils.js';

const geminiRestaurantSchema = {
  type: 'object',
  properties: {
    restaurants: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          cuisine: {
            type: 'array',
            items: { type: 'string' },
          },
          veg_nonveg: { type: 'string' },
          is_pure_veg: { type: 'boolean' },
          address: { type: 'string' },
          rating: { type: 'number' },
          price_range: { type: 'string' },
          opening_hours: { type: 'string' },
          contact_number: { type: 'string' },
          amenities: {
            type: 'array',
            items: { type: 'string' },
          },
          menu: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category_name: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      item_name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'string' },
                      veg_flag: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          image_url: { type: 'string' },
          reservation_link: { type: 'string' },
          source_url: { type: 'string' },
        },
      },
    },
  },
  required: ['restaurants'],
};

const fallbackToGemini = async ({ location, prompt, eventDate }) => {
  const locationLabel = formatLocationLabel(location) || 'the selected destination';
  const eventDateLabel = formatEventDate(eventDate);
  const dateContext = eventDateLabel
    ? `Dinner is planned for ${eventDateLabel}.`
    : 'Dinner date is flexible; suggest the next desirable slot.';

  const suggestion = await callGeminiJson({
    systemPrompt:
      'You are a dining concierge. Return structured restaurant options that match the schema and include rich menu details.',
    userPrompt: `Extract the best restaurants in ${locationLabel}. ${dateContext} User request: ${prompt}`,
    schema: geminiRestaurantSchema,
  });

  return {
    agent: 'restaurant',
    data: {
      location,
      eventDate: eventDate || null,
      eventDateLabel: eventDateLabel || null,
      restaurants: suggestion.restaurants || [],
      source: 'Gemini',
    },
  };
};

const tryZomatoListing = async ({ location, prompt, eventDate }) => {
  const { restaurants, url } = await fetchRestaurants({ location, prompt });

  if (!restaurants.length) {
    return null;
  }

  return {
    agent: 'restaurant',
    data: {
      location,
      eventDate: eventDate || null,
      eventDateLabel: formatEventDate(eventDate) || null,
      restaurants,
      source: 'Zomato (Firecrawl)',
      sourceUrl: url,
    },
  };
};

export const callRestaurantAgent = async ({ location, prompt, eventDate }) => {
  try {
    const zomatoPlan = await tryZomatoListing({ location, prompt, eventDate });

    if (zomatoPlan) {
      return zomatoPlan;
    }
  } catch (error) {
    console.warn('[restaurant.agent] Firecrawl Zomato fetch failed:', error.message);
  }

  return fallbackToGemini({ location, prompt, eventDate });
};

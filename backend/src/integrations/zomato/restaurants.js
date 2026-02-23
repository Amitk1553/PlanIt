import { firecrawlService } from '../../services/firecrawl.service.js';
import { restaurantListingSchema } from './schemas.js';
import { dedupeRestaurants } from './normalizers.js';
import { buildRestaurantListingUrl, formatLocationLabel } from './utils.js';

const DEFAULT_LOCATION_PREF = { country: 'IN', languages: ['en'] };

export const fetchRestaurants = async ({ location, prompt }) => {
  const url = buildRestaurantListingUrl(location);

  if (!url) {
    return { restaurants: [], url: null };
  }

  const locationLabel = formatLocationLabel(location) || 'the selected destination';
  const guidance = [
    `Extract every legitimate restaurant in ${locationLabel} from ${url}.`,
    'Return data strictly as valid JSON. Include only true dining venues (skip closed listings, ads, and non-food establishments).',
    'For each restaurant capture the name, cuisines, veg/non-veg status, pure veg flag, full address, rating, cost for two or price range, opening hours, contact number, amenities (AC, Outdoor Seating, Live Music, etc.), detailed menu categories with items, hero image URL, reservation/official link, and the exact source URL for the listing.',
    'Menu items must include name, description if visible, indicative price, and veg flag (Veg, Non-Veg, or Unknown). Deduplicate restaurants and set null for unknown fields.',
    `User context: ${prompt || 'restaurant hunt'}.`,
  ].join(' ');

  try {
    const payload = await firecrawlService.scrapeJson({
      url,
      schema: restaurantListingSchema,
      prompt: guidance,
      location: DEFAULT_LOCATION_PREF,
      maxAge: 0,
      storeInCache: false,
    });

    return { restaurants: dedupeRestaurants(payload?.restaurants).slice(0, 5), url };
  } catch (error) {
    console.warn('[zomato.restaurants] Firecrawl extraction failed:', error.message);
    return { restaurants: [], url };
  }
};

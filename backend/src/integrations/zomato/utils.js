const CITY_SLUG_OVERRIDES = {
  bengaluru: 'bangalore',
  bangalore: 'bangalore',
};

export const slugifyCityForZomato = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (CITY_SLUG_OVERRIDES[normalized]) {
    return CITY_SLUG_OVERRIDES[normalized];
  }

  return normalized
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .trim();
};

export const buildRestaurantListingUrl = (location) => {
  const slug = slugifyCityForZomato(location?.city);

  if (!slug) {
    return null;
  }

  return `https://www.zomato.com/${slug}`;
};

export const formatLocationLabel = (location) => {
  if (!location) {
    return '';
  }

  const { city, state, country } = location;
  return [city, state, country].filter(Boolean).join(', ');
};

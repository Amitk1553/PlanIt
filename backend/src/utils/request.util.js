export const sanitizeLocation = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

  const country = normalize(raw.country);
  const state = normalize(raw.state);
  const city = normalize(raw.city);

  if (!country || !state || !city) {
    return null;
  }

  return { country, state, city };
};

export const sanitizeDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

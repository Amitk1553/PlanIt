export const formatLocationLabel = (location) => {
  if (!location) {
    return '';
  }

  const { city, state, country } = location;
  return [city, state, country].filter(Boolean).join(', ');
};

export const slugifyCity = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

export const buildMoviesUrl = (location) => {
  const slug = slugifyCity(location?.city);

  if (!slug) {
    return null;
  }

  return `https://in.bookmyshow.com/explore/movies-${slug}?cat=MT`;
};

export const buildCinemaDirectoryUrl = (location) => {
  const slug = slugifyCity(location?.city);

  if (!slug) {
    return null;
  }

  return `https://in.bookmyshow.com/${slug}/cinemas`;
};

export const formatShowDateSegment = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const buildShowtimeUrl = ({ citySlug, movieSlug, eventId, showDateSegment }) => {
  if (!citySlug || !movieSlug || !eventId) {
    return null;
  }

  const dateSegment = showDateSegment || '';
  const base = `https://in.bookmyshow.com/movies/${citySlug}/${movieSlug}/buytickets/${eventId}`;
  return dateSegment ? `${base}/${dateSegment}` : base;
};

export const parseShowtimeMetadata = ({ bookingLink, fallbackTitle, citySlug }) => {
  if (!bookingLink) {
    return null;
  }

  try {
    const url = new URL(bookingLink);
    const segments = url.pathname.split('/').filter(Boolean);
    const moviesIndex = segments.indexOf('movies');

    if (moviesIndex === -1 || segments.length < moviesIndex + 5) {
      return null;
    }

    const parsedCity = segments[moviesIndex + 1];
    const movieSlug = segments[moviesIndex + 2];
    const eventId = segments[moviesIndex + 4] || segments[moviesIndex + 3];
    const dateSegment = segments[moviesIndex + 5] || null;

    return {
      citySlug: parsedCity || citySlug,
      movieSlug: movieSlug || slugifyCity(fallbackTitle),
      eventId: eventId && eventId.startsWith('ET') ? eventId : null,
      dateSegment,
    };
  } catch (error) {
    return null;
  }
};

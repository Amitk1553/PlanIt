import { firecrawlService } from '../../services/firecrawl.service.js';
import { formatEventDate } from '../../utils/date.util.js';
import { cinemaDirectorySchema, cinemaShowtimeSchema } from './schemas.js';
import { dedupeCinemas } from './normalizers.js';
import {
  buildCinemaDirectoryUrl,
  buildShowtimeUrl,
  formatLocationLabel,
  formatShowDateSegment,
  parseShowtimeMetadata,
  slugifyCity,
} from './utils.js';

const DEFAULT_LOCATION_PREF = { country: 'IN', languages: ['en'] };

export const fetchCinemaDirectory = async ({ location, prompt }) => {
  const url = buildCinemaDirectoryUrl(location);

  if (!url) {
    return { cinemas: [], url: null };
  }

  const locationLabel = formatLocationLabel(location) || 'the selected destination';

  try {
    const cinemaJson = await firecrawlService.scrapeJson({
      url,
      schema: cinemaDirectorySchema,
      prompt: [
        `Use ${url} to list every cinema/theatre for ${locationLabel}.`,
        'Capture locality, address, amenities, distance, poster/image URL, and booking link. Deduplicate by cinema name and return null when a field is missing.',
        `User request context: ${prompt || 'movie suggestions'}.`,
      ].join(' '),
      location: DEFAULT_LOCATION_PREF,
      maxAge: 0,
      storeInCache: false,
    });

    return { cinemas: dedupeCinemas(cinemaJson?.cinemas), url };
  } catch (error) {
    console.warn('[bookmyshow.cinemas] Firecrawl directory extraction failed:', error.message);
    return { cinemas: [], url };
  }
};

export const fetchShowtimeCinemas = async ({ movie, location, eventDate, prompt }) => {
  const citySlug = slugifyCity(location?.city);

  if (!movie || !citySlug) {
    return { cinemas: [], url: null };
  }

  const showDateSegment = formatShowDateSegment(eventDate);
  const showMeta = parseShowtimeMetadata({
    bookingLink: movie.booking_link,
    fallbackTitle: movie.title,
    citySlug,
  });

  const eventId = showMeta?.eventId || movie?.movie_id || null;
  const movieSlug = showMeta?.movieSlug || slugifyCity(movie?.title);
  const showtimeCitySlug = showMeta?.citySlug || citySlug;
  const showtimeDateSegment = showMeta?.dateSegment || showDateSegment;

  const url = buildShowtimeUrl({
    citySlug: showtimeCitySlug,
    movieSlug,
    eventId,
    showDateSegment: showtimeDateSegment,
  });

  if (!url) {
    return { cinemas: [], url: null };
  }

  const locationLabel = formatLocationLabel(location) || 'the selected destination';
  const eventDateLabel = formatEventDate(eventDate) || 'today';

  try {
    const showtimeJson = await firecrawlService.scrapeJson({
      url,
      schema: cinemaShowtimeSchema,
      prompt: [
        `Use ${url} to extract every cinema showing the selected movie on ${eventDateLabel}.`,
        'For each cinema capture locality, address, show date, and every showtime with time, format, language, price range, availability badge, and booking URL. Deduplicate entries and return null when data is missing.',
        `User request context: ${prompt || 'movie suggestions'}.`,
      ].join(' '),
      location: DEFAULT_LOCATION_PREF,
      maxAge: 0,
      storeInCache: false,
    });

    return { cinemas: dedupeCinemas(showtimeJson?.cinemas), url };
  } catch (error) {
    console.warn('[bookmyshow.cinemas] Firecrawl showtime extraction failed:', error.message);
    return { cinemas: [], url };
  }
};


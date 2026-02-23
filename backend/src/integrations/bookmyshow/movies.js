import { firecrawlService } from '../../services/firecrawl.service.js';
import { moviesSchema } from './schemas.js';
import { dedupeMovies } from './normalizers.js';
import { buildMoviesUrl, formatLocationLabel } from './utils.js';

const DEFAULT_LOCATION_PREF = { country: 'IN', languages: ['en'] };

export const fetchMovies = async ({ location, prompt }) => {
  const url = buildMoviesUrl(location);

  if (!url) {
    return { movies: [], url: null };
  }

  const locationLabel = formatLocationLabel(location) || 'the selected destination';

  try {
    const moviesJson = await firecrawlService.scrapeJson({
      url,
      schema: moviesSchema,
      prompt: [
        `Use ${url} to extract every active movie listing for ${locationLabel}.`,
        'Ignore ads/promoted tiles. For each movie capture title, languages, formats, genres, certificate, runtime, release date, poster URL, booking link, and any ID embedded in the URL. Deduplicate movies and return null for missing fields.',
        `User request context: ${prompt || 'movie suggestions'}.`,
      ].join(' '),
      location: DEFAULT_LOCATION_PREF,
      maxAge: 0,
      storeInCache: false,
    });

    return { movies: dedupeMovies(moviesJson?.movies).slice(0, 5), url };
  } catch (error) {
    console.warn('[bookmyshow.movies] Firecrawl extraction failed:', error.message);
    return { movies: [], url };
  }
};

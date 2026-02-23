import { callGeminiJson } from './gemini.helper.js';
import { formatEventDate } from '../utils/date.util.js';
import { fetchMovies } from '../integrations/bookmyshow/movies.js';
import {
  fetchCinemaDirectory,
  fetchShowtimeCinemas,
} from '../integrations/bookmyshow/cinemas.js';
import { mergeCinemaEntries } from '../integrations/bookmyshow/normalizers.js';
import { formatLocationLabel } from '../integrations/bookmyshow/utils.js';

const movieSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    overview: { type: 'string' },
    showtime: { type: 'string' },
    venue: { type: 'string' },
  },
  required: ['title', 'overview'],
};

const fallbackToGemini = async ({ location, prompt, eventDate }) => {
  const locationLabel = formatLocationLabel(location) || 'the selected destination';
  const eventDateLabel = formatEventDate(eventDate);
  const dateContext = eventDateLabel
    ? `The outing takes place on ${eventDateLabel}.`
    : 'The outing date is flexible; assume the next suitable evening.';

  const suggestion = await callGeminiJson({
    systemPrompt:
      'You are a concierge who recommends a movie outing. Respond with helpful but concise JSON suggestions.',
    userPrompt: `Suggest a movie plan for guests spending the evening in ${locationLabel}. ${dateContext} User request: ${prompt}`,
    schema: movieSchema,
  });

  return {
    agent: 'movie',
    data: {
      location,
      eventDate: eventDate || null,
      eventDateLabel: eventDateLabel || null,
      title: suggestion.title || 'Feature Film Recommendation',
      overview: suggestion.overview || suggestion.raw || 'Movie details unavailable.',
      showtime: suggestion.showtime || '8:00 PM',
      venue: suggestion.venue || locationLabel || 'Downtown Theater',
      source: 'Gemini',
    },
  };
};

const tryBookMyShowListing = async ({ location, prompt, eventDate }) => {
  const locationLabel = formatLocationLabel(location) || 'the selected destination';

  const { movies: movieList, url: moviesUrl } = await fetchMovies({ location, prompt });
  const { cinemas: cinemaDirectory } = await fetchCinemaDirectory({ location, prompt });
  const primaryMovie = movieList[0];

  const { cinemas: showtimeCinemas, url: showtimeUrl } = await fetchShowtimeCinemas({
    movie: primaryMovie,
    location,
    eventDate,
    prompt,
  });

  const mergedCinemas = mergeCinemaEntries(showtimeCinemas, cinemaDirectory);

  if (!movieList.length && !mergedCinemas.length) {
    return null;
  }

  const firstCinema = mergedCinemas[0];
  const firstMovie = primaryMovie;

  return {
    agent: 'movie',
    data: {
      location,
      eventDate: eventDate || null,
      eventDateLabel: formatEventDate(eventDate) || null,
      title: firstMovie?.title || `Movies in ${location?.city || 'your city'}`,
      overview: `Found ${movieList.length || 'several'} movies across ${
        mergedCinemas.length || 'multiple'
      } cinemas on BookMyShow for ${locationLabel}.`,
      showtime:
        firstCinema?.showtimes?.[0] ||
        (firstCinema?.showtimes_available ? 'Showtimes available on BookMyShow' : null),
      venue: firstCinema?.name || locationLabel || 'BookMyShow Listings',
      bookingLink:
        firstCinema?.bookingLink ||
        firstMovie?.booking_link ||
        showtimeUrl ||
        moviesUrl ||
        null,
      cinemas: mergedCinemas,
      movies: movieList,
      source: 'BookMyShow (Firecrawl)',
    },
  };
};

export const callMovieAgent = async ({ location, prompt, eventDate }) => {
  try {
    const bookMyShowPlan = await tryBookMyShowListing({ location, prompt, eventDate });

    if (bookMyShowPlan) {
      return bookMyShowPlan;
    }
  } catch (error) {
    console.warn('[movie.agent] Firecrawl BookMyShow fetch failed:', error.message);
  }

  return fallbackToGemini({ location, prompt, eventDate });
};

import { callMovieAgent } from '../agents/movie.agent.js';
import { sanitizeLocation, sanitizeDate } from '../utils/request.util.js';

export const movieController = {
  async getMovieListing(req, res) {
    const { prompt, location, date } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'A prompt string is required.',
      });
    }

    const normalizedLocation = sanitizeLocation(location);
    if (!normalizedLocation) {
      return res.status(400).json({
        status: 'error',
        message: 'Provide a valid location with city, state, and country.',
      });
    }

    const normalizedDate = sanitizeDate(date);
    if (date && !normalizedDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Provide an ISO 8601 string (e.g. 2026-02-22).',
      });
    }

    const result = await callMovieAgent({
      location: normalizedLocation,
      prompt,
      eventDate: normalizedDate,
    });

    return res.status(200).json(result);
  },
};

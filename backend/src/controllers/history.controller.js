import { prisma } from '../config/prisma.js';

export const historyController = {
  async saveSearch(req, res) {
    const { prompt, city, state, country, date, weather, movies, restaurants } = req.body;

    if (!prompt || !city) {
      return res.status(400).json({ status: 'error', message: 'prompt and city are required.' });
    }

    const record = await prisma.searchHistory.create({
      data: {
        userId: req.user.id,
        prompt,
        city,
        state: state || '',
        country: country || '',
        date: date || '',
        weather: weather ?? null,
        movies: movies ?? null,
        restaurants: restaurants ?? null,
      },
    });

    return res.status(201).json(record);
  },

  async getHistory(req, res) {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return res.json(history);
  },

  async getSearchById(req, res) {
    const id = Number(req.params.id);

    const record = await prisma.searchHistory.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!record) {
      return res.status(404).json({ status: 'error', message: 'Search not found.' });
    }

    return res.json(record);
  },

  async deleteSearch(req, res) {
    const id = Number(req.params.id);

    const record = await prisma.searchHistory.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!record) {
      return res.status(404).json({ status: 'error', message: 'Search not found.' });
    }

    await prisma.searchHistory.delete({ where: { id } });
    return res.json({ status: 'ok' });
  },
};

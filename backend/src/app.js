import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import planRoutes from './routes/plan.routes.js';
import userRoutes from './routes/user.routes.js';
import movieRoutes from './routes/movie.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import historyRoutes from './routes/history.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { scrapeMovies } from './services/scraper.js';
import { scrapeRestaurants } from './services/zomato-scraper.js';
import { getDayWeather } from './services/weather.service.js';
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/api', planRoutes);
app.use('/api', userRoutes);
app.use('/api', movieRoutes);
app.use('/api', restaurantRoutes);
app.use('/api', historyRoutes);

app.get("/api/weather", async (req, res) => {
  try {
    const { city, date } = req.query;
    if (!city) return res.status(400).json({ error: "city query param is required" });
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const data = await getDayWeather(city, targetDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/movies", async (req, res) => {
  const movies = await scrapeMovies(req.query.url);
  res.json(movies);
});

// const { scrapeRestaurants } = require("./zomato-scraper");
app.get("/api/restaurants", async (req, res) => {
  const restaurants = await scrapeRestaurants(req.query.url);
  res.json(restaurants);
});

app.use(errorMiddleware);

export { app };

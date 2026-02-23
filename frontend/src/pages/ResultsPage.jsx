import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, CloudSun, Film, Utensils } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { planItApi } from '@/lib/api';

const dayparts = [
  { key: 'Morning', label: 'Morning' },
  { key: 'Afternoon', label: 'Afternoon' },
  { key: 'Evening', label: 'Evening' },
  { key: 'Night', label: 'Night' },
];

function formatDayPart(part) {
  if (!part) return 'No data yet';
  if (typeof part === 'string') return part;
  const temp = typeof part.temp_c === 'number' ? `${Math.round(part.temp_c)}°C` : '–°C';
  const condition = part.condition ?? 'Forecast pending';
  const rain = typeof part.rain_chance_percent === 'number' ? `${part.rain_chance_percent}% rain` : 'Rain chance n/a';
  return `${temp} · ${condition} · ${rain}`;
}

function safeString(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(safeString).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    if (value.time) {
      const parts = [value.time, value.format, value.language].filter(Boolean);
      return parts.join(' · ');
    }
    return Object.values(value).filter((v) => typeof v === 'string').join(' · ') || JSON.stringify(value);
  }
  return String(value);
}

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const [weather, setWeather] = useState(null);
  const [moviePlan, setMoviePlan] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [movieError, setMovieError] = useState(null);
  const [restaurantError, setRestaurantError] = useState(null);

  const prompt = searchParams.get('prompt') || '';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';
  const country = searchParams.get('country') || '';
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!prompt) {
      setLoadingWeather(false);
      setLoadingMovies(false);
      setLoadingRestaurants(false);
      return;
    }

    planItApi.getWeather(city, date)
      .then((res) => setWeather(res))
      .catch((err) => setWeatherError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoadingWeather(false));

    planItApi.getScrapedMovies(city)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setMoviePlan({ movies: list.slice(0, 5), source: 'BookMyShow' });
      })
      .catch((err) => setMovieError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoadingMovies(false));

    planItApi.getScrapedRestaurants(city)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setRestaurants(list.slice(0, 5));
      })
      .catch((err) => setRestaurantError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoadingRestaurants(false));
  }, [prompt, city, state, country, date]);

  // Animate each section as it finishes loading
  useEffect(() => {
    if (loadingWeather) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.weather-animate', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }, resultsRef);
    return () => ctx.revert();
  }, [loadingWeather]);

  useEffect(() => {
    if (loadingMovies) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.movie-animate', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }, resultsRef);
    return () => ctx.revert();
  }, [loadingMovies]);

  useEffect(() => {
    if (loadingRestaurants) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.restaurant-animate', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }, resultsRef);
    return () => ctx.revert();
  }, [loadingRestaurants]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-forest-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(20,70,60,0.5),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(15,80,80,0.3),transparent_50%)]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/8 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-lg font-semibold tracking-tight text-white">PlanIT</span>
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-600 text-xs font-semibold text-white transition hover:bg-olive-500">
          U
        </button>
      </header>

      {/* Query summary – centered, minimal */}
      <div className="relative z-10 shrink-0 border-b border-white/5 py-3 text-center">
        <p className="text-sm text-white/90">
          <span className="font-medium">{prompt}</span>
          <span className="mx-2 text-white/20">·</span>
          <span className="text-white/50">{[city, state, country].filter(Boolean).join(', ')}</span>
          <span className="mx-2 text-white/20">·</span>
          <span className="text-white/50">{date}</span>
        </p>
      </div>

      {/* Three-column results */}
      <main className="relative z-10 flex min-h-0 flex-1 gap-0 p-4" ref={resultsRef}>

        {/* ──── Column 1: Weather ──── */}
        <div className="flex w-1/3 flex-col border-r border-white/8">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-5 py-3">
            <CloudSun className="h-4 w-4 text-sage-400" />
            <span className="text-sm font-semibold text-white/90">Weather</span>
            <Badge className="ml-auto border-white/10 text-[10px] text-white/60" variant="outline">Open-Meteo</Badge>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
            {weatherError && (
              <p className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">{weatherError}</p>
            )}

            {loadingWeather ? (
              <div className="space-y-3">
                {dayparts.map((p) => <Skeleton key={p.key} className="h-20 rounded-xl bg-white/5" />)}
              </div>
            ) : (
              <div className="weather-animate space-y-3">
                {weather?.city && (
                  <p className="mb-2 text-xs text-white/40">{weather.city} — {weather.date}</p>
                )}
                {dayparts.map((p) => (
                  <div key={p.key} className="rounded-xl border border-white/8 bg-forest-900/60 p-4">
                    <p className="text-xs font-semibold text-sage-400">{p.label}</p>
                    <p className="mt-1.5 text-sm text-white/80">{formatDayPart(weather?.[p.key])}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ──── Column 2: Movies ──── */}
        <div className="flex w-1/3 flex-col border-r border-white/8">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-5 py-3">
            <Film className="h-4 w-4 text-olive-400" />
            <span className="text-sm font-semibold text-white/90">Movies</span>
            {moviePlan?.source && (
              <Badge className="ml-auto border-white/10 text-[10px] text-white/60" variant="outline">{moviePlan.source}</Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
            {movieError && (
              <p className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">{movieError}</p>
            )}

            {loadingMovies ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />)}
              </div>
            ) : Array.isArray(moviePlan?.movies) && moviePlan.movies.length > 0 ? (
              <div className="movie-animate space-y-3">
                {moviePlan.movies.slice(0, 5).map((movie) => (
                  <a
                    key={movie.eventId ?? movie.movieName ?? movie.title}
                    href={
                      movie.movieUrl
                        ? (movie.movieUrl.startsWith('http') ? movie.movieUrl : `https://in.bookmyshow.com${movie.movieUrl}`)
                        : movie.booking_link || '#'
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-xl border border-white/8 bg-forest-900/60 transition hover:border-white/15 hover:bg-forest-800/60"
                  >
                    {movie.imageUrl && (
                      <div className="h-28 w-full overflow-hidden">
                        <img
                          src={movie.imageUrl}
                          alt={movie.movieName || movie.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 p-4">
                      <p className="text-sm font-semibold text-white group-hover:text-teal-300">
                        {movie.movieName || movie.title}
                      </p>
                      <p className="text-xs text-white/50">
                        {[movie.languages, movie.rated || movie.certificate, safeString(movie.duration)].filter(Boolean).join(' · ')}
                      </p>
                      <span className="mt-1 inline-flex text-xs font-medium text-teal-400 group-hover:underline">
                        Book tickets →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No movies found. Try a different city.</p>
            )}
          </div>
        </div>

        {/* ──── Column 3: Restaurants ──── */}
        <div className="flex w-1/3 flex-col">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-5 py-3">
            <Utensils className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-white/90">Restaurants</span>
            {restaurants.length > 0 && (
              <Badge className="ml-auto border-white/10 text-[10px] text-white/60" variant="outline">Zomato</Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
            {restaurantError && (
              <p className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">{restaurantError}</p>
            )}

            {loadingRestaurants ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl bg-white/5" />)}
              </div>
            ) : restaurants.length > 0 ? (
              <div className="restaurant-animate space-y-3">
                {restaurants.slice(0, 5).map((r) => (
                  <a
                    key={r.name}
                    href={r.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-xl border border-white/8 bg-forest-900/60 transition hover:border-white/15 hover:bg-forest-800/60"
                  >
                    {r.image && (
                      <div className="h-28 w-full overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 p-4">
                      <p className="text-sm font-semibold text-white group-hover:text-teal-300">{r.name}</p>
                      <p className="text-xs text-white/50">{r.cuisine || 'Cuisine TBD'}</p>
                      <p className="text-xs text-white/30 line-clamp-1">{r.address}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        {r.rating > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-olive-600/80 px-2 py-0.5 font-medium text-white">
                            ⭐ {r.rating}
                          </span>
                        )}
                        {r.reviewCount && (
                          <span className="text-white/40">{r.reviewCount} reviews</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No restaurants found yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

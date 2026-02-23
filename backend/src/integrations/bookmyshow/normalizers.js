const coerceStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string' && entry.trim());
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeShowtimeEntries = (entries) => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (typeof entry === 'string') {
        return {
          time: entry,
          format: null,
          language: null,
          price_range: null,
          availability: null,
          booking_url: null,
        };
      }

      if (entry && typeof entry === 'object') {
        return {
          time: entry.time || entry.label || null,
          format: entry.format || entry.screen || null,
          language: entry.language || null,
          price_range: entry.price_range || entry.price || null,
          availability: entry.availability || entry.status || null,
          booking_url: entry.booking_url || entry.bookingUrl || entry.link || null,
        };
      }

      return null;
    })
    .filter(Boolean);
};

const normalizeCinemaRecord = (cinema) => {
  if (!cinema || !cinema.name) {
    return null;
  }

  return {
    name: cinema.name || null,
    location: cinema.location || null,
    address: cinema.address || null,
    amenities: coerceStringArray(cinema.amenities),
    distance: cinema.distance || null,
    showtimes_available:
      typeof cinema.showtimes_available === 'boolean' ? cinema.showtimes_available : null,
    image: cinema.image || cinema.imageUrl || cinema.poster || null,
    show_date: cinema.show_date || null,
    showtimes: normalizeShowtimeEntries(cinema.showtimes),
    bookingLink: cinema.bookingUrl || cinema.link || null,
  };
};

export const dedupeCinemas = (cinemas = []) => {
  const map = new Map();

  cinemas.forEach((entry) => {
    const normalized = normalizeCinemaRecord(entry);
    if (!normalized?.name) {
      return;
    }

    if (!map.has(normalized.name)) {
      map.set(normalized.name, normalized);
    }
  });

  return Array.from(map.values());
};

const extractMovieIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const match = url.match(/(ET\d{5,})/i);
  if (match) {
    return match[1].toUpperCase();
  }

  return null;
};

const normalizeMovieRecord = (movie) => {
  if (!movie || !movie.title) {
    return null;
  }

  const languages = coerceStringArray(movie.languages ?? movie.language);
  const formats = coerceStringArray(movie.formats ?? movie.format);
  const genres = coerceStringArray(movie.genre);
  const bookingLink = movie.booking_link || movie.bookingLink || movie.url || null;
  const movieId = movie.movie_id || extractMovieIdFromUrl(bookingLink);

  return {
    title: movie.title,
    language: languages[0] || movie.language || null,
    languages: languages.length ? languages : null,
    format: formats[0] || movie.format || null,
    formats: formats.length ? formats : null,
    genre: genres.length ? genres : null,
    certificate: movie.certificate || null,
    duration: movie.duration || null,
    release_date: movie.release_date || movie.releaseDate || null,
    poster_url: movie.poster_url || movie.posterUrl || movie.poster || movie.image || null,
    booking_link: bookingLink,
    movie_id: movieId,
  };
};

export const dedupeMovies = (movies = []) => {
  const map = new Map();

  movies.forEach((entry) => {
    const normalized = normalizeMovieRecord(entry);
    if (!normalized?.title) {
      return;
    }

    const key = `${normalized.title.toLowerCase()}-${normalized.language || 'all'}`;

    if (!map.has(key)) {
      map.set(key, normalized);
    }
  });

  return Array.from(map.values());
};

export const mergeCinemaEntries = (showtimeCinemas = [], directoryCinemas = []) => {
  const directoryMap = new Map(directoryCinemas.map((cin) => [cin.name, cin]));

  const merged = showtimeCinemas.map((showCinema) => {
    const directoryInfo = directoryMap.get(showCinema.name);

    if (!directoryInfo) {
      return showCinema;
    }

    return {
      ...directoryInfo,
      ...showCinema,
      location: showCinema.location || directoryInfo.location || null,
      address: showCinema.address || directoryInfo.address || null,
      amenities:
        (showCinema.amenities && showCinema.amenities.length > 0
          ? showCinema.amenities
          : directoryInfo.amenities) || null,
      distance: showCinema.distance || directoryInfo.distance || null,
      image: showCinema.image || directoryInfo.image || null,
      bookingLink: showCinema.bookingLink || directoryInfo.bookingLink || null,
    };
  });

  directoryCinemas.forEach((cin) => {
    if (!merged.find((item) => item.name === cin.name)) {
      merged.push(cin);
    }
  });

  return merged;
};

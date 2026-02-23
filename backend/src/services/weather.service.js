/**
 * Open-Meteo weather service – free, no API key required.
 * Provides day-part weather (Morning / Afternoon / Evening / Night)
 * for any city on a given date.
 */

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * @param {string} city   – city name, e.g. "Jamshedpur"
 * @param {string} date   – ISO date string, e.g. "2025-07-15"
 * @returns {Promise<object>} – { city, date, Morning, Afternoon, Evening, Night }
 */
export async function getDayWeather(city, date) {
  /* ---------- 1. Geocode the city ---------- */
  const geoRes = await fetch(
    `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
  );
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City "${city}" not found via Open-Meteo geocoding.`);
  }

  const { latitude, longitude, name } = geoData.results[0];

  /* ---------- 2. Fetch hourly forecast ---------- */
  const weatherRes = await fetch(
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=temperature_2m,precipitation_probability` +
      `&timezone=auto&start_date=${date}&end_date=${date}`,
  );
  const weatherData = await weatherRes.json();

  const hours = weatherData.hourly?.time ?? [];
  const temps = weatherData.hourly?.temperature_2m ?? [];
  const rain = weatherData.hourly?.precipitation_probability ?? [];

  /* ---------- 3. Bucket into day-parts ---------- */
  const buckets = {
    Morning: { tempSum: 0, rainMax: 0, count: 0 },   // 06-11
    Afternoon: { tempSum: 0, rainMax: 0, count: 0 },  // 12-16
    Evening: { tempSum: 0, rainMax: 0, count: 0 },    // 17-20
    Night: { tempSum: 0, rainMax: 0, count: 0 },      // 21-05
  };

  hours.forEach((iso, i) => {
    const h = new Date(iso).getHours();
    let part;
    if (h >= 6 && h <= 11) part = 'Morning';
    else if (h >= 12 && h <= 16) part = 'Afternoon';
    else if (h >= 17 && h <= 20) part = 'Evening';
    else part = 'Night';

    buckets[part].tempSum += temps[i];
    buckets[part].rainMax = Math.max(buckets[part].rainMax, rain[i]);
    buckets[part].count += 1;
  });

  const result = { city: name, date };

  for (const [part, b] of Object.entries(buckets)) {
    if (b.count === 0) {
      result[part] = 'No data';
    } else {
      const avgTemp = (b.tempSum / b.count).toFixed(1);
      result[part] = `${avgTemp}°C • Rain ${b.rainMax}%`;
    }
  }

  return result;
}

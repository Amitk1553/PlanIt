export const moviesSchema = {
  type: 'object',
  properties: {
    movies: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          language: { type: 'string' },
          languages: {
            type: 'array',
            items: { type: 'string' },
          },
          format: { type: 'string' },
          formats: {
            type: 'array',
            items: { type: 'string' },
          },
          genre: {
            type: 'array',
            items: { type: 'string' },
          },
          certificate: { type: 'string' },
          duration: { type: 'string' },
          release_date: { type: 'string' },
          poster_url: { type: 'string' },
          booking_link: { type: 'string' },
          movie_id: { type: 'string' },
        },
        required: ['title'],
      },
    },
  },
  required: ['movies'],
};

export const cinemaDirectorySchema = {
  type: 'object',
  properties: {
    cinemas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          location: { type: 'string' },
          address: { type: 'string' },
          amenities: {
            type: 'array',
            items: { type: 'string' },
          },
          distance: { type: 'string' },
          image: { type: 'string' },
          bookingUrl: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  required: ['cinemas'],
};

export const cinemaShowtimeSchema = {
  type: 'object',
  properties: {
    cinemas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          location: { type: 'string' },
          address: { type: 'string' },
          show_date: { type: 'string' },
          showtimes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                format: { type: 'string' },
                language: { type: 'string' },
                price_range: { type: 'string' },
                availability: { type: 'string' },
                booking_url: { type: 'string' },
              },
            },
          },
        },
        required: ['name'],
      },
    },
  },
  required: ['cinemas'],
};

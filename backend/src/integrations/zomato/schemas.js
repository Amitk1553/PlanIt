export const restaurantListingSchema = {
  type: 'object',
  properties: {
    restaurants: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          cuisine: {
            oneOf: [
              { type: 'array', items: { type: 'string' } },
              { type: 'string' },
            ],
          },
          veg_nonveg: { type: 'string' },
          is_pure_veg: { type: 'boolean' },
          address: { type: 'string' },
          rating: { type: 'string' },
          price_range: { type: 'string' },
          opening_hours: { type: 'string' },
          contact_number: { type: 'string' },
          amenities: {
            type: 'array',
            items: { type: 'string' },
          },
          menu: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category_name: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      item_name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'string' },
                      veg_flag: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          image_url: { type: 'string' },
          reservation_link: { type: 'string' },
          source_url: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  required: ['restaurants'],
};

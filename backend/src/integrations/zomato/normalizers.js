const toArray = (value) => {
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

const allowedVegStatuses = new Set(['Pure Veg', 'Veg & Non-Veg', 'Non-Veg', 'Unknown']);

const deriveVegStatus = (value, isPureVeg) => {
  if (isPureVeg === true) {
    return 'Pure Veg';
  }

  if (typeof value === 'string' && allowedVegStatuses.has(value)) {
    return value;
  }

  return 'Unknown';
};

const normalizeMenuItems = (items = []) =>
  items
    .map((item) => {
      if (!item) {
        return null;
      }

      if (typeof item === 'string') {
        return {
          item_name: item,
          description: null,
          price: null,
          veg_flag: 'Unknown',
        };
      }

      return {
        item_name: item.item_name || item.name || null,
        description: item.description || item.details || null,
        price: item.price || null,
        veg_flag: item.veg_flag || item.vegFlag || 'Unknown',
      };
    })
    .filter((entry) => entry?.item_name);

const normalizeMenuCategories = (categories = []) =>
  categories
    .map((category) => {
      if (!category) {
        return null;
      }

      const categoryName = category.category_name || category.name || null;
      const items = normalizeMenuItems(category.items || []);

      if (!categoryName && !items.length) {
        return null;
      }

      return {
        category_name: categoryName,
        items: items.length ? items : null,
      };
    })
    .filter((entry) => entry && (entry.category_name || entry.items));

const normalizeRestaurantRecord = (record) => {
  if (!record?.name) {
    return null;
  }

  const cuisines = toArray(record.cuisine ?? record.cuisines);
  const amenities = toArray(record.amenities);
  const menu = normalizeMenuCategories(record.menu || []);
  const isPureVeg = typeof record.is_pure_veg === 'boolean' ? record.is_pure_veg : null;
  const vegStatus = deriveVegStatus(record.veg_nonveg, isPureVeg);
  const ratingValue = record.rating ? Number(record.rating) : null;

  return {
    name: record.name,
    cuisine: cuisines.length ? cuisines : null,
    veg_nonveg: vegStatus,
    is_pure_veg: isPureVeg,
    address: record.address || null,
    rating: Number.isFinite(ratingValue) ? ratingValue : record.rating || null,
    price_range: record.price_range || record.cost_for_two || null,
    opening_hours: record.opening_hours || record.hours || null,
    contact_number: record.contact_number || record.phone || null,
    amenities: amenities.length ? amenities : null,
    menu: menu.length ? menu : null,
    image_url: record.image_url || record.image || null,
    reservation_link: record.reservation_link || record.booking_link || record.source_url || null,
    source_url: record.source_url || record.url || null,
  };
};

export const dedupeRestaurants = (restaurants = []) => {
  const map = new Map();

  restaurants.forEach((entry) => {
    const normalized = normalizeRestaurantRecord(entry);
    if (!normalized?.name) {
      return;
    }

    const key = `${normalized.name.toLowerCase()}-${normalized.address || ''}`;
    if (!map.has(key)) {
      map.set(key, normalized);
    }
  });

  return Array.from(map.values());
};

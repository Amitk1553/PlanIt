const DATE_OPTIONS = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

export const formatEventDate = (eventDate) => {
  if (!eventDate) {
    return null;
  }

  try {
    const parsed = new Date(eventDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleDateString('en-US', DATE_OPTIONS);
  } catch (error) {
    return null;
  }
};

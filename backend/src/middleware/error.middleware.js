export const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error('Unexpected error:', err);
  }

  res.status(status).json({
    status: 'error',
    message,
  });
};

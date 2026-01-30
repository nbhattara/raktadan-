const config = require('../config');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma validation error
  if (err.code === 'P2002') {
    return res.status(400).json({
      status: 'Error',
      message: 'Duplicate entry. This record already exists.',
      ...(config.NODE_ENV === 'development' && { error: err.meta?.target })
    });
  }

  // Prisma foreign key constraint error
  if (err.code === 'P2003') {
    return res.status(400).json({
      status: 'Error',
      message: 'Foreign key constraint failed.',
      ...(config.NODE_ENV === 'development' && { error: err.meta?.target })
    });
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'Error',
      message: 'Record not found.',
      ...(config.NODE_ENV === 'development' && { error: err.meta?.cause })
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'Error',
      message: 'Invalid token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'Error',
      message: 'Token expired.'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'Error',
      message: 'Validation failed.',
      errors: err.details
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'Error',
    message,
    ...(config.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
};

const notFound = (req, res, next) => {
  // Don't treat favicon.ico as an error
  if (req.originalUrl === '/favicon.ico') {
    return res.status(204).end();
  }
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};

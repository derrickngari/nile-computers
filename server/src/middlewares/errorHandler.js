import { logger } from '../services/logger.js';

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    logger.error(
      `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

    if (process.env.NODE_ENV === 'production'){
        res.status(statusCode).json({ error: message});
    } else {
        res.status(statusCode).json({ error: message, stack: err.stack });
    }
}

const notFoundHandler = (req, res, next) => {
    const err = new Error('Not Found - ', req.originalUrl);
    err.statusCode = 404;
    next(err);
}

export {
    errorHandler,
    notFoundHandler,
};
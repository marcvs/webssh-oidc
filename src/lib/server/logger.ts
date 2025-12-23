import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  sync: true, // Disable async logging for immediate output
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  }
});

export default logger;
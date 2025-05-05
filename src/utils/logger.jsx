const LOG_LEVELS = ["debug", "info", "warn", "error"];
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const logger = {
  log: (level, message, data = null) => {
    if (!LOG_LEVELS.includes(level)) {
      console.error(`[Logger] Invalid log level: ${level}`);
      return;
    }

    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (process.env.NODE_ENV === "development") {
      console[level](formatted, data || "");
    }

    if (process.env.NODE_ENV === "production") {
      fetch(BASE_URL + "/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp,
          userAgent: navigator.userAgent,
        }),
      }).catch((err) => {});
    }
  },

  info: (msg, data) => logger.log("info", msg, data),
  warn: (msg, data) => logger.log("warn", msg, data),
  error: (msg, data) => logger.log("error", msg, data),
  debug: (msg, data) => logger.log("debug", msg, data),
};

export default logger;

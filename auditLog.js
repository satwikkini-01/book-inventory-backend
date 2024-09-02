const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.MongoDB({
            level: "info",
            db: process.env.MONGO_URL,
            collection: "audit-logs",
            options: { useUnifiedTopology: true },
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

module.exports = logger;

module.exports = {
  port: 9000,
  log: {
    level: "info",
    disabled: false,
  },
  pagination: {
    limit: 100,
    offset: 0,
  },
  cors: {
    origins: ["http://localhost:3000"],
    maxAge: 3 * 60 * 60,
  },
};

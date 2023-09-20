module.exports = {
  log: {
    level: "silly",
    disabled: true,
  },
  cors: {
    origins: ["http://localhost:3000"],
    maxAge: 3 * 60 * 60,
  },
  pagination: {
    limit: 100,
    offset: 0,
  },
};

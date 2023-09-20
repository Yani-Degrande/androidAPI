const { PrismaClient } = require("@prisma/client");

const { getLogger } = require("../core/logger");
const prisma = new PrismaClient();

async function initializeData() {
  const logger = getLogger();
  logger.info("Initializing data");
  prisma.$connect().catch(async (e) => {
    logger.error("Failed to connect to database", e);
    closeDatabase();
  });

  await prisma.$queryRaw`SELECT 1 + 1 AS result`.catch(async (e) => {
    logger.error("Failed to connect to database", e);
    closeDatabase();
  });
  logger.info("Data initialized");
  return prisma;
}

function getPrisma() {
  if (!prisma) throw new Error("Prisma not initialized");
  return prisma;
}

async function closeDatabase() {
  const logger = getLogger();
  logger.info("Closing database connection");
  await prisma.$disconnect().catch(async (e) => {
    logger.error("Failed to disconnect from database", e);
    await prisma.$disconnect();
    process.exit(1);
  });
  logger.info("Database connection closed");
}

module.exports = {
  initializeData,
  getPrisma,
  closeDatabase,
};

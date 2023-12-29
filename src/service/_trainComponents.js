// - Local dependencies
const { getLogger } = require("../core/logger.js");
const { getPrisma } = require("../data/index.js");
const ServiceError = require("../core/serviceError.js");

// - Logger
const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// =========== functions =================

// - Get all Leagues
const getAllTrainComponents = async () => {
  debugLog(`getting all traincomponents`);

  const foundTrainComponents = await getPrisma().trainComponent.findMany();

  if (!foundTrainComponents) {
    throw new ServiceError(404, "No traincomponents found");
  }

  return foundTrainComponents;
};

const getTrainComponentById = async (id) => {
  debugLog(`getting traincomponent with id ${id}`);

  const foundTrainComponent = await getPrisma().trainComponent.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!foundTrainComponent) {
    throw new ServiceError(404, "No traincomponent found");
  }

  return foundTrainComponent;
};

module.exports = {
  getAllTrainComponents,
  getTrainComponentById,
};

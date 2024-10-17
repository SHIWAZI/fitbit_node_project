const logger = require('../utils/logger');

exports.get = async (query, TableName) => {
  try {
    return await TableName.findOne(query);
  } catch (err) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${err}`);
    throw Error("Get Error!!! " + err);
  }
};

exports.getAll = async (query,TableName) => {
  try {
    return await TableName.findAll(query);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("Get ALL Error!!! " + e);
  }
};

exports.update = async (updateData, query, TableName) => {
  try {
    return TableName.update(updateData, query);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("Update Failed!!! " + e);
  }
};

exports.create = async (queryData, TableName) => {
  try {
    return await TableName.create(queryData);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("Create Failed!!! " + e);
  }
};

exports.count = async (query, TableName) => {
  try {
    return await TableName.count(query);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("Count Error!!! " + e);
  }
};

exports.sum = async (fieldName,query, TableName) => {
  try {
    return await TableName.sum(fieldName,query);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("Count Error!!! " + e);
  }
};

exports.delete = async (query, TableName) => {
  try {
    return await TableName.destroy(query);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("Count Error!!! " + e);
  }
};

exports.findAndCountAll = async (query, TableName) => {
  try {
    return await TableName.findAndCountAll(query);
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'TableSchemaError' ] - ${e}`);
    throw Error("find And Count All Error!!! " + e);
  }
};

const CayenneSensorsService = require('../services/external/cayenne-sensors.service');
const { connect: connect2Db } = require('../database/database');
require('dotenv/config');

function testGetSensorsData() {
  const cayenneSensorsService = new CayenneSensorsService();
  return cayenneSensorsService.fetchAllData();
}

function start() {
  connect2Db().then((connected) => {
    if (!connected) {
      console.log('Not connected to server');
      return;
    }

    console.log('Starting jobs...');
    return testGetSensorsData();
  });
}

start();

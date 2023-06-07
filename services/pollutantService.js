const pollutants = require('../models/pollutants.js')

class PollutantService {
  static getMonitorData(documents) {
    const monitorData = {}
  
    documents.forEach(document => {
      const fields = document.document.fields
      const numberOfDocuments = documents.length
  
      const moqaID = fields.moqaID.stringValue
      const humidity = fields.hum.integerValue
      const temperature = fields.intTemp.doubleValue
      const latitude = fields.latitude?.doubleValue || 0
      const longitude = fields.longitude?.doubleValue || 0
  
      if (!monitorData[moqaID]) {
        monitorData[moqaID] = {
          humidity: [humidity],
          temperature: [temperature],
          latitude,
          longitude,
          NO2: [],
          CO: [],
          O3: [],
          PM25: [],
          PM10: [],
          numberOfDocuments,
        };
      } else {
        monitorData[moqaID].humidity.push(humidity)
        monitorData[moqaID].temperature.push(temperature)
      }
  
      pollutants.map(pollutant => {
        const value = fields[pollutant]?.integerValue || 0
        monitorData[moqaID][pollutant].push(value)
      });
    });
  
    Object.keys(monitorData).map(moqaID => {
      const dataLength = monitorData[moqaID].humidity.length
  
      monitorData[moqaID].humidity = monitorData[moqaID].humidity.reduce((sum, humidity) => sum + humidity, 0) / dataLength

      monitorData[moqaID].temperature = monitorData[moqaID].temperature.reduce((sum, temperature) => sum + temperature, 0) / dataLength
  
      pollutants.map(pollutant => {
        const sum = monitorData[moqaID][pollutant].reduce((sum, value) => sum + value, 0)
        monitorData[moqaID][pollutant] = sum / dataLength
      })
    })
  
    return monitorData
  }
}

module.exports = {
  PollutantService
}

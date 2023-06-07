const axios = require('axios');
require('dotenv').config();

class QueryService {
  static async getDocuments(idToken, projectId, collectionPath) {
    const query_url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/:runQuery`;

    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    const oneHourAgo = new Date();
    oneHourAgo.setHours(currentHour - 1);

    let oneHourAgoISO = oneHourAgo.toISOString();
    oneHourAgoISO = "2023-05-01T00:00:00Z"; // linha hardcoded

    const queryPayload = {
      "structuredQuery": {
        "where": {
          "fieldFilter": {
            "field": { "fieldPath": "myTimestamp" },
            "op": "GREATER_THAN",
            "value": { "timestampValue": oneHourAgoISO }
          }
        },
        "from": [{ "collectionId": collectionPath }]
      }
    };

    const config = {
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      }
    };

    try {
      const response = await axios.post(query_url, queryPayload, config);

      if (response.data) {
        return response.data;
      } else {
        throw new Error(response.data.error.message);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = {
  QueryService
};

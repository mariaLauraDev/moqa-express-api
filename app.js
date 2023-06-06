const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.get('/moqa-last-your', (req, res) => {
  const login_url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`;
  const query_url = `https://firestore.googleapis.com/v1/projects/${process.env.PROJECT_ID}/databases/(default)/documents/:runQuery`;

  const sigin_payload = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    returnSecureToken: true
  };
  console.log('payload', sigin_payload);

  axios.post(login_url, sigin_payload)
    .then(response => {
      if (response.data.idToken) {
        const idToken = response.data.idToken;
        console.log('idToken', idToken);

        const dataAtual = new Date();
        const horaAtual = dataAtual.getHours();

        const umaHoraAtras = new Date();
        umaHoraAtras.setHours(horaAtual - 1);

        let umaHoraAtrasISO = umaHoraAtras.toISOString();
        umaHoraAtrasISO = "2023-05-01T00:00:00Z"

        const queryPayload = {
          "structuredQuery": {
            "where": {
              "fieldFilter": {
                "field": { "fieldPath": "myTimestamp" },
                "op": "GREATER_THAN",
                "value": { "timestampValue": umaHoraAtrasISO }
              }
            },
            "from": [{ "collectionId": process.env.COLLECTION_PATH }]
          }
        };

        const config = {
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          }
        };

        axios.post(query_url, queryPayload, config)
          .then(response => {
            const payload = response.data;
            const averagePollutants = calculateAveragePollutants(payload);

            res.status(200).json(averagePollutants);
          })
          .catch(error => {
            res.status(500).json({ error: error.message });
          });
      } else {
        res.status(400).json({ error: response.data.error.message });
      }
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

function calculateAveragePollutants(documents) {
  const pollutants = ["NO2", "CO", "O3", "PM25", "PM10"];
  const monitorData = {};
  const dataAtual = new Date();
  const horaAtual = dataAtual.getHours();

  for (const document of documents) {
    const fields = document.document.fields;

    const moqaID = fields.moqaID.stringValue;
    const data = dataAtual.toISOString();
    const horario = horaAtual;

    const humidade = fields.hum.integerValue;
    const temperatura = fields.intTemp.doubleValue;
    const latitude = fields.latitude?.doubleValue || 0;
    const longitude = fields.longitude?.doubleValue || 0;

    if (!monitorData[moqaID]) {
      monitorData[moqaID] = {
        data,
        horario,
        humidade: [humidade],
        temperatura: [temperatura],
        latitude,
        longitude,
        NO2: [],
        CO: [],
        O3: [],
        PM25: [],
        PM10: []
      };
    } else {
      monitorData[moqaID].humidade.push(humidade);
      monitorData[moqaID].temperatura.push(temperatura);
    }

    pollutants.forEach(pollutant => {
      const value = fields[pollutant]?.integerValue || 0;
      monitorData[moqaID][pollutant].push(value);
    });
  }

  for (const moqaID in monitorData) {
    const dataLength = monitorData[moqaID].humidade.length;
    console.log('dataLength', dataLength);

    monitorData[moqaID].humidade = monitorData[moqaID].humidade.reduce((sum, value) => sum + value, 0) / monitorData[moqaID].humidade.length;
    monitorData[moqaID].temperatura = monitorData[moqaID].temperatura.reduce((sum, value) => sum + value, 0) / monitorData[moqaID].temperatura.length;

    pollutants.forEach(pollutant => {
      const sum = monitorData[moqaID][pollutant].reduce((sum, value) => sum + value, 0);
      monitorData[moqaID][pollutant] = sum / dataLength;
    });
  }

  return monitorData;
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

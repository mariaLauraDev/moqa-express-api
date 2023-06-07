const { AuthService } = require('../services/authService.js')
const { QueryService } = require('../services/queryService.js')
const { PollutantService } = require('../services/pollutantService.js')
require('dotenv').config()

class PollutantController {
  static async getMonitorData(req, res) {
    try {
      const encodedApiKey = req.headers.authorization.split(' ')[1]
      const decodedApiKey = Buffer.from(encodedApiKey, 'base64').toString('utf-8')
      const [email, password] = decodedApiKey.split(':')

      const idToken = await AuthService.getIdToken(email, password)

      const documents = await QueryService.getDocuments(idToken, process.env.PROJECT_ID,  process.env.COLLECTION_PATH)

      console.log('documents:', documents)
      const monitorData = PollutantService.getMonitorData(documents)

      const responseData = {
        data: monitorData,
      }

      return res.json(responseData)
    } catch (error) {
      console.error('Erro ao obter os dados do monitor:', error)
      return res.status(500).json({ error: 'Erro ao obter os dados do monitor' })
    }
  }
}

module.exports = PollutantController;

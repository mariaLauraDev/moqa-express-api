const axios = require('axios')
require('dotenv').config()

class AuthService {
  static async getIdToken(email, password) {
    const login_url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`

    const sigin_payload = {
      email,
      password,
      returnSecureToken: true
    }

    try {
      const response = await axios.post(login_url, sigin_payload)

      if (response.data.idToken) {
        return response.data.idToken
      } else {
        throw new Error(response.data.error.message)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = {
  AuthService
}

const express = require('express')
const dotenv = require('dotenv')
const PollutantController = require('./controllers/pollutantController.js')
dotenv.config()

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// rotas
app.get('/average-pollutants', PollutantController.getMonitorData)

// servidor
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
});

//é mais performático usar a biblioteca do firebase ou interagir com api?
//qual o tamanho do projeto com cada tipo de interação com o firebase?
//nao mostrar projeto, mas entender os requisitos deles, podemos nos posicionar em levantar o payload
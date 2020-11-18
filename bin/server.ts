import 'reflect-metadata'

import '../src/Controller/HealthCheckController'

import * as bodyParser from 'body-parser'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import { InversifyExpressServer } from 'inversify-express-utils'
import { config } from 'dotenv'

config()

const container = ContainerConfigLoader.Load()

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
  app.use(bodyParser.urlencoded({
    extended: true,
  }))
  app.use(bodyParser.json())
})

const serverInstance = server.build()
serverInstance.listen(process.env.PORT)

console.log(`Server started on port ${process.env.PORT}`)

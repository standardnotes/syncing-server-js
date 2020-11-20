import 'reflect-metadata'
import '../src/Controller/HealthCheckController'
import '../src/Controller/RevisionsController'

import * as bodyParser from 'body-parser'
import * as prettyjson from 'prettyjson'

import { InversifyExpressServer, getRouteInfo } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
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

const routeInfo = getRouteInfo(container)

console.log(prettyjson.render({ routes: routeInfo }))

serverInstance.listen(process.env.PORT)

console.log(`Server started on port ${process.env.PORT}`)

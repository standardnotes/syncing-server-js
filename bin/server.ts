import 'reflect-metadata'
import '../src/Controller/HealthCheckController'
import '../src/Controller/RevisionsController'

import * as bodyParser from 'body-parser'
import * as prettyjson from 'prettyjson'
import * as expressWinston from 'express-winston'
import * as winston from 'winston'

import { InversifyExpressServer, getRouteInfo } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/env'

const container = ContainerConfigLoader.Load()

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
  app.use(bodyParser.urlencoded({
    extended: true,
  }))
  app.use(bodyParser.json())

  app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            format: winston.format.json(),
        }),
    ],
    ignoreRoute: function (req, _res) { return ['/healthcheck', '/favicon.ico'].indexOf(req.path.replace(/\/$/, '')) >= 0 },
}))
})

const serverInstance = server.build()

const routeInfo = getRouteInfo(container)

console.log(prettyjson.render({ routes: routeInfo }))

const env: Env = container.get(TYPES.Env)

serverInstance.listen(env.get('PORT'))

const loggerFactory: () => winston.Logger = container.get(TYPES.LoggerFactory)
const logger = loggerFactory()

logger.info(`Server started on port ${process.env.PORT}`)

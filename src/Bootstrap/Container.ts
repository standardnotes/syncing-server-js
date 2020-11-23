import * as winston from 'winston'
import { Container, interfaces } from 'inversify'
import { InMemoryRevisionRepository } from '../Infra/InMemory/InMemoryRevisionRepository'
import { Env } from './Env'
import TYPES from './Types'

export class ContainerConfigLoader {
    public static Load(): Container {
        const container = new Container()
        container.bind<InMemoryRevisionRepository>(TYPES.RevisionRepository).to(InMemoryRevisionRepository)
        container.bind<Env>(TYPES.Env).to(Env)
        container.bind<interfaces.Factory<winston.Logger>>(TYPES.LoggerFactory).toFactory<winston.Logger>((context: interfaces.Context) => {
          return () => {
            const env: Env = context.container.get(TYPES.Env)
            const logLevel = env.get('LOG_LEVEL') || 'info'

            return  winston.createLogger({
              level: logLevel,
              format: winston.format.combine(
                  winston.format.splat(),
                  winston.format.json(),
              ),
              transports: [
                  new winston.transports.Console({ level: logLevel }),
              ],
            })
          }
        })

        return container
    }
}

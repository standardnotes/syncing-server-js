import { Container } from 'inversify'
import { InMemoryRevisionRepository } from '../Infra/InMemory/InMemoryRevisionRepository'
import TYPES from './Types'

export class ContainerConfigLoader {
    public static Load(): Container {
        const container = new Container()
        container.bind<InMemoryRevisionRepository>(TYPES.RevisionRepository).to(InMemoryRevisionRepository)
        return container
    }
}

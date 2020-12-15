import 'reflect-metadata'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { User } from '../User/User'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'

describe('AuthResponseFactory20190520', () => {
  let userProjector: ProjectorInterface<User>
  let user: User

  const createFactory = () => new AuthResponseFactory20190520(
    userProjector,
    'secret'
  )

  beforeEach(() => {
    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    user = {} as jest.Mocked<User>
    user.encryptedPassword = 'test123'
  })

  it('should create a 20161215 auth response', async () => {
    const response = await createFactory().createResponse(user, '20161215', 'Google Chrome')

    expect(response).toEqual({
      user: { foo: 'bar' },
      token: expect.any(String)
    })
  })
})

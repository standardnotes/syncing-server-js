import 'reflect-metadata'
import { totp } from 'otplib'

import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { VerifyMFA } from './VerifyMFA'

describe('VerifyMFA', () => {
  let user: User
  let item: Item
  let userRepository: UserRepositoryInterface
  let itemRepository: ItemRepositoryInterface
  let contentDecoder: ContentDecoderInterface

  const createVerifyMFA = () => new VerifyMFA(userRepository, itemRepository, contentDecoder)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    item = {} as jest.Mocked<Item>
    item.uuid = '1-2-3'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(null)

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({})
  })

  it('should pass MFA verification if user has no MFA enabled', async () => {
    expect(await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {} })).toEqual({
      success: true
    })
  })

  it('should not pass MFA verification if user is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)
    expect(await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {} })).toEqual({
      success: false,
      errorMessage: 'Invalid email or password'
    })
  })

  it('should not pass MFA verification if mfa param is not found in the request', async () => {
    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(item)

    expect(await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {} })).toEqual({
      success: false,
      errorTag: 'mfa-required',
      errorMessage: 'Please enter your two-factor authentication code.',
      errorPayload: { mfa_key: 'mfa_1-2-3' }
    })
  })

  it('should not pass MFA verification if mfa is not correct', async () => {
    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(item)

    expect(await createVerifyMFA().execute({ email: 'test@test.te', requestParams: { 'mfa_1-2-3': 'test' } })).toEqual({
      success: false,
      errorTag: 'mfa-invalid',
      errorMessage: 'The two-factor authentication code you entered is incorrect. Please try again.',
      errorPayload: { mfa_key: 'mfa_1-2-3' }
    })
  })

  it('should pass MFA verification if mfa key is correct', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({
      secret: 'shhhh'
    })

    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(item)

    expect(await createVerifyMFA().execute({ email: 'test@test.te', requestParams: { 'mfa_1-2-3': totp.generate('shhhh') } })).toEqual({
      success: true,
    })
  })
})

import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  SESSIONS_PROTOCOL_VERSION = 4

  @PrimaryColumn({
    length: 36
  })
  uuid: string

  @Column({
    length: 255,
    nullable: true
  })
  version: string

  @Column({
    length: 255,
    nullable: true
  })
  email: string

  @Column({
    name: 'pw_nonce',
    length: 255,
    nullable: true
  })
  pwNonce: string

  @Column({
    name: 'kp_created',
    length: 255,
    nullable: true
  })
  kpCreated: string

  @Column({
    name: 'kp_origination',
    length: 255,
    nullable: true
  })
  kpOrigination: string

  @Column({
    name: 'pw_cost',
    width: 11,
    type: 'int',
    nullable: true
  })
  pwCost: number

  @Column({
    name: 'pw_key_size',
    width: 11,
    type: 'int',
    nullable: true
  })
  pwKeySize: number

  @Column({
    name: 'pw_salt',
    length: 255,
    nullable: true
  })
  pwSalt: string

  @Column({
    name: 'pw_alg',
    length: 255,
    nullable: true
  })
  pwAlg: string

  @Column({
    name: 'pw_func',
    length: 255,
    nullable: true
  })
  pwFunc: string

  @Column({
    name: 'encrypted_password',
    length: 255
  })
  encryptedPassword: string

  supportsSessions(): boolean {
    return parseInt(this.version) >= this.SESSIONS_PROTOCOL_VERSION
  }
}

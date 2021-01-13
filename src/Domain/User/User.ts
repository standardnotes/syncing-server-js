import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm'
import { RevokedSession } from '../Session/RevokedSession'

@Entity({ name: 'users' })
export class User {
  private readonly SESSIONS_PROTOCOL_VERSION = 4

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
  @Index('index_users_on_email')
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

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date

  @Column({
    name: 'locked_until',
    type: 'datetime',
    nullable: true
  })
  lockedUntil: Date | null

  @Column({
    name: 'num_failed_attempts',
    type: 'int',
    width: 11,
    nullable: true
  })
  numberOfFailedAttempts: number | null

  @Column({
    name: 'updated_with_user_agent',
    type: 'text',
    nullable: true
  })
  updatedWithUserAgent: string | null

  @OneToMany(
    /* istanbul ignore next */
    () => RevokedSession,
    /* istanbul ignore next */
    revokedSession => revokedSession.user
  )
  revokedSessions: Promise<RevokedSession[]>

  supportsSessions(): boolean {
    return parseInt(this.version) >= this.SESSIONS_PROTOCOL_VERSION
  }
}

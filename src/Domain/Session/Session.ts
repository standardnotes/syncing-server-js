import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryColumn()
  uuid: string

  @Column({ name: 'user_uuid' })
  userUuid: string

  @Column({ name: 'hashed_access_token' })
  hashedAccessToken: string

  @Column({ name: 'access_expiration' })
  accessExpiration: Date

  @Column({ name: 'refresh_expiration' })
  refreshExpiration: Date

  accessExpired(): boolean {
    return this.accessExpiration < new Date()
  }

  refreshExpired(): boolean {
    return this.refreshExpiration < new Date()
  }
}

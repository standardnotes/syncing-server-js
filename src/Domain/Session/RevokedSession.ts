import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm'
import { User } from '../User/User'

@Entity({ name: 'revoked_sessions' })
export class RevokedSession {
  @PrimaryColumn({
    length: 36
  })
  uuid: string

  @Column({
    name: 'user_uuid',
    length: 255,
  })
  @Index('index_revoked_sessions_on_user_uuid')
  userUuid: string

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    user => user.revokedSessions, { onDelete: 'CASCADE' }
  )
  user: Promise<User>
}

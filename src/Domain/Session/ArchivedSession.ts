import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ name: 'archived_sessions' })
export class ArchivedSession {
  @PrimaryColumn({
    length: 36
  })
  uuid: string

  @Column({
    name: 'user_uuid',
    length: 255,
  })
  @Index('index_archived_sessions_on_user_uuid')
  userUuid: string

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date
}

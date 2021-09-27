import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Revision } from '../Revision/Revision'

@Entity({ name: 'items' })
@Index('index_items_on_user_uuid_and_content_type', ['userUuid', 'contentType'])
@Index('user_uuid_and_updated_at_timestamp_and_created_at_timestamp', ['userUuid', 'updatedAtTimestamp', 'createdAtTimestamp'])
@Index('user_uuid_and_deleted', ['userUuid', 'deleted'])
export class Item {
  @PrimaryGeneratedColumn('uuid')
  uuid: string

  @Column({
    type: 'varchar',
    name: 'duplicate_of',
    length: 36,
    nullable: true,
  })
  duplicateOf: string | null

  @Column({
    name: 'items_key_id',
    length: 255,
    nullable: true,
  })
  itemsKeyId: string

  @Column({
    type: 'mediumtext',
    nullable: true,
  })
  content: string | null

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Index('index_items_on_content_type')
  contentType: string | null

  @Column({
    name: 'enc_item_key',
    type: 'text',
    nullable: true,
  })
  encItemKey: string | null

  @Column({
    name: 'auth_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  authHash: string | null

  @Column({
    name: 'user_uuid',
    length: 255,
  })
  @Index('index_items_on_user_uuid')
  userUuid: string

  @Column({
    type: 'tinyint',
    precision: 1,
    nullable: true,
    default: 0,
  })
  @Index('index_items_on_deleted')
  deleted: boolean

  @Column({
    name: 'last_user_agent',
    type: 'text',
    nullable: true,
  })
  lastUserAgent: string | null

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 6,
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
  })
  updatedAt: Date

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  @Index('updated_at_timestamp')
  updatedAtTimestamp: number

  @OneToMany(
    /* istanbul ignore next */
    () => Revision,
    /* istanbul ignore next */
    revision => revision.item
  )
  revisions: Promise<Revision[]>
}

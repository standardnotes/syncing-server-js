import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { Item } from '../Item/Item'

@Entity({ name: 'revisions' })
export class Revision {
  @PrimaryColumn({
    length: 36
  })
  uuid: string

  @Column({
    name: 'item_uuid',
    length: 255,
    nullable: true
  })
  @Index('index_revisions_on_item_uuid')
  itemUuid: string

  @Column({
    type: 'mediumtext',
    nullable: true
  })
  content: string

  @Column({
    name: 'content_type',
    length: 255,
    nullable: true
  })
  contentType: string

  @Column({
    name: 'items_key_id',
    length: 255,
    nullable: true
  })
  itemsKeyId: string

  @Column({
    name: 'enc_item_key',
    type: 'text',
    nullable: true
  })
  encItemKey: string

  @Column({
    name: 'auth_hash',
    length: 255,
    nullable: true
  })
  authHash: string

  @Column({
    name: 'creation_date',
    type: 'date',
    nullable: true
  })
  @Index('index_revisions_on_creation_date')
  creationDate: Date

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 6,
    nullable: true
  })
  @Index('index_revisions_on_created_at')
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
    nullable: true
  })
  updatedAt: Date

  @ManyToMany(
    /* istanbul ignore next */
    () => Item
  )
  @JoinTable({
    name: 'item_revisions',
    joinColumn: {
        name: 'revision_uuid',
        referencedColumnName: 'uuid'
    },
    inverseJoinColumn: {
        name: 'item_uuid',
        referencedColumnName: 'uuid'
    }
  })
  items: Promise<Item[]>
}

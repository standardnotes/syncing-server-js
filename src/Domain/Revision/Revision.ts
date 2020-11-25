import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { Item } from '../Item/Item'

@Entity({ name: 'revisions' })
export class Revision {
  @PrimaryColumn()
  uuid: string

  @Column({ name: 'item_uuid' })
  itemUuid: string

  @Column()
  content: string

  @Column({ name: 'content_type' })
  contentType: string

  @Column({ name: 'items_key_id' })
  itemsKeyId: string

  @Column({ name: 'enc_item_key' })
  encItemKey: string

  @Column({ name: 'auth_hash' })
  authHash: string

  @Column({ name: 'creation_date' })
  creationDate: Date

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => Item)
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
  items: Array<Item>
}

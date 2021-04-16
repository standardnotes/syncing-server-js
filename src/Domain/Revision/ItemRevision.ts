import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'item_revisions' })
export class ItemRevision {
  @PrimaryGeneratedColumn('uuid')
  uuid: string

  @Column({
    type: 'varchar',
    name: 'revision_uuid',
    length: 36,
  })
  @Index('index_item_revisions_on_revision_uuid')
  revisionUuid: string

  @Column({
    type: 'varchar',
    name: 'item_uuid',
    length: 36,
  })
  @Index('index_item_revisions_on_item_uuid')
  itemUuid: string
}

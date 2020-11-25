import { Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { Revision } from '../Revision/Revision'

@Entity({ name: 'items' })
export class Item {
  @PrimaryColumn()
  uuid: string

  @ManyToMany(() => Revision)
  @JoinTable({
    name: 'item_revisions',
    joinColumn: {
        name: 'item_uuid',
        referencedColumnName: 'uuid'
    },
    inverseJoinColumn: {
        name: 'revision_uuid',
        referencedColumnName: 'uuid'
    },
  })
  revisions: Array<Revision>
}

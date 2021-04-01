import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ name: 'extension_settings' })
export class ExtensionSetting {
  @PrimaryColumn({
    length: 36,
  })
  uuid: string

  @Column({
    type: 'varchar',
    name: 'extension_id',
    length: 255,
    nullable: true,
  })
  @Index('index_extension_settings_on_extension_id')
  extensionId: string | null

  @Column({
    type: 'tinyint',
    name: 'mute_emails',
    precision: 1,
    nullable: true,
    default: 0,
  })
  muteEmails: boolean

  @Column({
    name: 'created_at',
    type: 'datetime',
    default:
      /* istanbul ignore next */
      () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default:
      /* istanbul ignore next */
      () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
}

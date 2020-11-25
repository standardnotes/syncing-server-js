import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  SESSIONS_PROTOCOL_VERSION = 4

  @PrimaryColumn()
  uuid: string

  @Column()
  version: string

  @Column({ name: 'encrypted_password' })
  encryptedPassword: string

  supportsSessions(): boolean {
    return parseInt(this.version) >= this.SESSIONS_PROTOCOL_VERSION
  }
}

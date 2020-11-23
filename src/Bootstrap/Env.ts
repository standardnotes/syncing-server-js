import { config, DotenvParseOutput } from 'dotenv'
import { injectable } from 'inversify'

@injectable()
export class Env {
  private env: DotenvParseOutput

  public load(): void {
    const output = config()
    this.env = <DotenvParseOutput> output.parsed
  }

  public get(key: string) :string {
    if (!this.env) {
      this.load()
    }

    return this.env[key]
  }
}

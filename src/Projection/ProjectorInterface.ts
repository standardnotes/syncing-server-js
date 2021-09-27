export interface ProjectorInterface<T> {
  projectSimple(object: T): Promise<Record<string, unknown>>
  projectFull(object: T): Promise<Record<string, unknown>>
  projectCustom(projectionType: string, object: T, ...args: any[]): Promise<Record<string, unknown>>
}

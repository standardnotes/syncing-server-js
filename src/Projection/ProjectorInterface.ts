export interface ProjectorInterface<T> {
  projectSimple(object: T): Record<string, unknown>
  projectFull(object: T): Record<string, unknown>
}

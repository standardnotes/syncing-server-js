export interface EventMessageHandlerInterface {
  handleMessage (message: string): Promise<void>
  handleError (error: Error): Promise<void>
}

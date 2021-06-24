export class BaseError extends Error {
  public type: string

  public constructor(type: string, message?: string) {
    super(message)
    this.type = type
  }
}

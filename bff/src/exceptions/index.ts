/**
 * Exception for crashable error.
 */
export abstract class CrashableError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CrashableError.prototype);
  }
}

import { CrashableError } from '.';

/**
 * Exception for environment error.
 */
export class ApiError extends CrashableError {
  constructor(message: string) {
    super(message);
    this.name = ApiError.name;
  }
}

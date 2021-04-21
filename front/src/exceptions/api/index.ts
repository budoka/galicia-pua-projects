import { CrashableError } from '..';

/**
 * Exception for API error.
 */
export class APIError extends CrashableError {
  constructor(message: string) {
    super(message);
    this.name = APIError.name;
  }
}

import { CrashableError } from '..';

/**
 * Exception for environment error.
 */
export class EnviromentError extends CrashableError {
  constructor(message: string) {
    super(message);
    this.name = EnviromentError.name;
  }
}

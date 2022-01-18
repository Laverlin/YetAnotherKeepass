export class YakpError {
  errorId: string;

  message: string;

  constructor(errorId: string, message: string) {
    this.errorId = errorId;
    this.message = message;
  }
}

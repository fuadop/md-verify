export interface VError {
  msg: string;
  rule: string;
}

export default class VerifyError extends Error {
  public errors: VError[];
  constructor(errors: VError[], message: string = "Verification Error") {
    super(message);
    this.errors = errors;
  }
}

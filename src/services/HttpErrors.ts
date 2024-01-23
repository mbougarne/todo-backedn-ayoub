import { HttpErrorCode } from "../types";

export class HttpErrors extends Error {
  private occursAt: Date | string;

  code: HttpErrorCode;

  errorText: string;

  constructor(message: string, code: HttpErrorCode) {
    super(message);
    this.name = this.constructor.name;
    this.occursAt = new Date().toString();
    this.code = code;
    this.errorText = this.getErrorText(code);

    Error.captureStackTrace(this, this.constructor);
  }

  toJson = () => {
    const { errorText, message, code, cause, name, stack, occursAt } = this;
    return { errorText, message, code, cause, name, stack, occursAt };
  };

  toString = () => {
    const { errorText, message, code, name, occursAt } = this;
    return `[${occursAt}] | ${name}: ${message}.  ErrorText: ${errorText}, ErrorCode: ${code}`;
  };

  getMessage = () => this.message;

  // eslint-disable-next-line class-methods-use-this
  private getErrorText = (code: HttpErrorCode): string => {
    const errorCodeText = {
      400: "Bad Request",
      401: "UnAuthenticated",
      403: "Unauthorized",
      404: "Not Found",
      409: "Conflict",
      415: "Unsupported Media Type",
      422: "Unprocessable Entity",
      500: "Internal Server Error",
    };

    return errorCodeText[code];
  };
}

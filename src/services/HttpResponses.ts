import { Response } from "express";

import { HttpErrorCode, HttpSuccessCode } from "../types";
import { HttpErrors } from "./HttpErrors";

export class HttpResponses {
  private httpErrors: InstanceType<typeof HttpErrors> | undefined;

  private response: Response;

  private successCode: HttpSuccessCode;

  constructor(response: Response, successCode: HttpSuccessCode = 200) {
    this.response = response;
    this.successCode = successCode;
  }

  setCode = (code: HttpSuccessCode) => {
    this.successCode = code;
    return this;
  };

  successResponse = (data: Record<string, any>) =>
    this.response.status(this.successCode).json({
      success: true,
      statusCode: this.successCode,
      statusText: this.getSuccessText(this.successCode),
      data,
    });

  errorResponse = (message: string, code: HttpErrorCode) => {
    this.httpErrors = new HttpErrors(message, code);

    return this.response
      .status(this.httpErrors.code)
      .json(this.jsonErrorResponse());
  };

  private jsonErrorResponse = (): Record<string, any> => ({
    success: false,
    statusCode: this.httpErrors?.code,
    statusText: this.httpErrors?.errorText,
    message: this.httpErrors?.getMessage(),
  });

  // eslint-disable-next-line class-methods-use-this
  private getSuccessText = (code: HttpSuccessCode = 200): string => {
    const successStatusText = {
      200: "OK",
      201: "Created",
      204: "No Content",
    };

    return successStatusText[code];
  };
}

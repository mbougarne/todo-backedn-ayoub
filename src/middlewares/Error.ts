import { NextFunction, Request, Response } from "express";
import { HttpResponses, HttpErrors } from "../services";

export const errorMiddleware = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const httpError = new HttpErrors(
    error.message || "Server Error",
    500
  ).toJson();
  console.log(error);
  if (res.headersSent) {
    return next(httpError);
  }

  return new HttpResponses(res).errorResponse(
    error.message || "Server Error",
    500
  );
};

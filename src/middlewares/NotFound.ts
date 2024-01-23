import { NextFunction, Request, Response } from "express";
import { HttpResponses } from "../services";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction
) => {
  const { protocol, originalUrl } = req;

  const fullUri = `${protocol}://${req.get("host")}${originalUrl}`;
  const message = `The requested resource ${fullUri} not found on the server`;

  return new HttpResponses(res).errorResponse(message, 404);
};

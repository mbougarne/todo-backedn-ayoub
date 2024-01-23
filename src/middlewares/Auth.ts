/* eslint-disable consistent-return */
import { NextFunction, Request, Response } from "express";

import { authentication, HttpResponses } from "../services";

const tokenErrorMessages: Record<string, any> = {
  TokenExpiredError:
    "The token expired, a new one will be issued to you through refresh token",
  JsonWebTokenError: "Invalid Token, please try to login to issued a new one",
};

const nonProtectedPaths = ["/api/v1/users/signup", "/api/v1/users/login"];

export const verifyAuthentication = (
  req: Request & Record<string, any>,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "POST" && nonProtectedPaths.includes(req.path)) {
    return next();
  }

  const httpResponses = new HttpResponses(res);
  const authHeader = req.headers?.authorization;

  if (!authHeader || authHeader.split(" ")[0] !== "Bearer") {
    return httpResponses.errorResponse(
      "Please login to access this resource",
      401
    );
  }

  const token = authHeader.split(" ")[1];
  const verifyToken = authentication.validateAccess(token) as Record<
    string,
    any
  >;

  if (verifyToken.isError) {
    if (verifyToken.errorName === "TokenExpiredError") {
      res.locals.isRefresh = true;
      res.locals.oldToken = token;
      next();
    } else {
      return httpResponses.errorResponse(
        tokenErrorMessages[verifyToken.errorName],
        403
      );
    }
  }

  req.user = verifyToken.payload.user.userId;

  next();
};

export const authRefresh = (
  req: Request & Record<string, any>,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "POST" && nonProtectedPaths.includes(req.path)) {
    return next();
  }

  const httpResponses = new HttpResponses(res);
  const { isRefresh, oldToken } = res.locals;

  if (isRefresh && oldToken.length) {
    const refToken = req.headers["x-auth-refresh"] as string;

    if (!refToken) {
      return httpResponses.errorResponse(
        "The headers missing [x-auth-refresh] header",
        400
      );
    }

    const result = authentication.validateRefresh(refToken) as Record<
      string,
      any
    >;

    if (result.isError) {
      res.locals.refreshTokenNeedsUpdate = true;

      return httpResponses.errorResponse(
        "RefreshToken needs update, please login to issued a new one",
        403
      );
    }

    const { user } = result.payload;
    const newToken = authentication.token(user);

    req.user = user.userId;

    return httpResponses.successResponse({ newToken });
  }

  next();
};

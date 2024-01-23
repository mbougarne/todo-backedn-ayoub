/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from "express";
import {
  GeneratedTokenPayload,
  UserControllerInterface,
  UserSchema,
} from "../types";

import { HttpResponses, authentication } from "../services";
import { UserRepository } from "../repositories";
import { isValidEmail, isValidPassword } from "../validator";

export class UserController implements UserControllerInterface {
  private repository: InstanceType<typeof UserRepository>;

  constructor() {
    this.repository = new UserRepository();
  }

  /**
   * Login User
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.response(res)?.errorResponse(
          "The email and password are required",
          400
        );
      }

      const user = await this.repository.single({ email });

      if (user === null) {
        return this.response(res)?.errorResponse(
          "There is no user with the provided email",
          401
        );
      }

      const isPasswordMatched = await authentication.verifyPassword(
        password,
        user.password!
      );

      if (!isPasswordMatched) {
        return this.response(res)?.errorResponse("The password is wrong", 401);
      }

      const jwtPayload: GeneratedTokenPayload = {
        user: {
          userId: user.userId!,
        },
      };

      const token = authentication.token(jwtPayload);
      let refreshToken;

      if (!user.refreshToken || res.locals.refreshTokenNeedsUpdate) {
        refreshToken = authentication.refreshToken(jwtPayload);
        await this.repository.saveRefreshToken({ email }, refreshToken);
      } else {
        refreshToken = user.refreshToken;
      }

      const data = {
        name: user.fullName!,
        refreshToken,
        token,
        todos: user.todos,
      };

      return this.response(res)?.successResponse(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new user
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const validateRequest = await this.validateCreationRequest(req, res);

      if (validateRequest !== null) {
        return;
      }

      const userData = req.body as UserSchema;
      const createdUser = await this.repository.create(userData);

      return this.response(res)?.setCode(201).successResponse(createdUser);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update existing user data
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  update = async (
    req: Request & Record<string, any>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = req.user;
      const validateRequest = await this.validationUpdateRequest(req, res);

      if (validateRequest !== null) {
        return;
      }

      await this.repository.update(req.body, { userId });

      return this.response(res)
        ?.setCode(204)
        .successResponse({ message: "User has updated!" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete User
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  destroy = async (
    req: Request & Record<string, any>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = req.user;

      await this.repository.destroy({ userId });

      return this.response(res)?.successResponse({ message: "User deleted" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Select user from DB with the username, email, or both
   *
   * @param {Request} req Http Incoming Request
   * @returns {Object} return filter fields object
   */
  private getFilterFields = (req: Request) => {
    const filter = {
      ...(req.body.username && { username: req.body.username! }),
      ...(req.body.email && { email: req.body.email! }),
    };

    return filter;
  };

  /**
   * Validate Incoming HTTP Request when user is signing up
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @returns Return Null or HTTP Response
   */
  private validateCreationRequest = async (req: Request, res: Response) => {
    if (
      !req.body.username ||
      !req.body.email ||
      !req.body.password ||
      !req.body.fullName
    ) {
      const message =
        "The request missing all or some required fields: username, email, password, or fullName";
      return this.response(res)?.errorResponse(message, 400);
    }

    const isEmailValid = isValidEmail(req.body.email);

    if (!isEmailValid) {
      return this.response(res)?.errorResponse(
        "The email is not valid email",
        400
      );
    }

    const isPasswordValid = isValidPassword(req.body.password);

    if (!isPasswordValid) {
      const message =
        "The password is not valid, it should be minimum 8 in length, with chars, numbers, and one of these special chars: @$!%*#?&\\-_\"'";
      return this.response(res)?.errorResponse(message, 400);
    }

    req.body.password = await authentication.hashPassword(req.body.password);

    const filter = this.getFilterFields(req);
    const isUsernameOrEmailExists = await this.repository.exists(filter);

    if (isUsernameOrEmailExists) {
      return this.response(res)?.errorResponse(
        "The username or email already taken",
        401
      );
    }

    return null;
  };

  /**
   * Validate Incoming HTTP Request on update user
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @returns Return Null or HTTP Response
   */
  private validationUpdateRequest = async (
    req: Request & Record<string, any>,
    res: Response
  ) => {
    const userId = req.user;

    if (userId === undefined) {
      return this.response(res)?.errorResponse(
        "Please, login to generate new access token and try again.",
        403
      );
    }

    const previousUser = await this.repository.single({ userId });

    if (previousUser === null) {
      return this.response(res)?.errorResponse(
        "The user does not exists on the system",
        401
      );
    }

    if (req.body.username !== undefined || req.body.email !== undefined) {
      const filter = this.getFilterFields(req);
      const isEmailOrUsernameTaken = await this.repository.exists(
        filter,
        userId,
        false
      );

      if (isEmailOrUsernameTaken) {
        return this.response(res)?.errorResponse(
          "The username or email is already taken",
          409
        );
      }
    }

    if (req.body.password !== undefined) {
      req.body.password = await authentication.hashPassword(req.body.password);
    }

    return null;
  };

  /**
   * Instantiate a HttpResponses class
   *
   * @param {Response} res Http Outgoing Response
   * @returns {HttpResponses} Instance of the HttpResponses class
   */
  private response = (res: Response) => {
    const httpResponses = new HttpResponses(res);
    return httpResponses;
  };
}

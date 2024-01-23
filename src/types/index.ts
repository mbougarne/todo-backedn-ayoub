/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export type JwtVerifyReturn = string | boolean | undefined | JwtPayload;
export type HttpErrorCode = 400 | 401 | 403 | 404 | 409 | 415 | 422 | 500;
export type HttpSuccessCode = 200 | 201 | 204;

export type UserSchema = {
  userId?: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  refreshToken?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [propName: string]: any;
};

export type TodoSchema = {
  todoId?: string;
  ownerId: string;
  title: string;
  body?: string;
  thumbnail?: string;
  isDone?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [propName: string]: any;
};

export type UserFilter = Partial<
  Pick<UserSchema, "userId" | "username" | "email">
>;
export type UserFilterKeys = keyof Omit<UserFilter, "userId">;
export type UniqueUserFields = Record<UserFilterKeys, string>;

export interface UserControllerInterface {
  login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  destroy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
}

export interface TodoControllerInterface {
  all(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  single(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  destroy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
  completed(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>;
}

export interface UserModelInterface {
  create(user: UserSchema): Promise<Record<string, any> | never>;
  single(filter: UserFilter): Promise<Partial<UserSchema> | null>;
  update(
    user: Partial<UserSchema>,
    filter: UserFilter
  ): Promise<Record<string, any> | null>;
  destroy(filter: UserFilter): Promise<boolean | never>;
}

export interface TodoModelInterface {
  all(ownerId: string): Promise<TodoSchema[] | []>;
  single(todoId: string): Promise<TodoSchema | null>;
  create(todo: TodoSchema): Promise<TodoSchema | never>;
  edit(
    todoId: string,
    todo: Partial<TodoSchema>
  ): Promise<Record<string, any> | null>;
  destroy(todoId: string): Promise<boolean | never>;
  completed(
    todoId: string,
    isDone: boolean
  ): Promise<Record<string, any> | null>;
}

export interface GeneratedTokenPayload {
  user: {
    userId: string;
  };
}

/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
import { Request, Response, NextFunction } from "express";
import { TodoRepository } from "../repositories";
import { HttpResponses, HandleFileUpload } from "../services";
import { TodoControllerInterface, TodoSchema } from "../types";

export class TodoController implements TodoControllerInterface {
  private repository: InstanceType<typeof TodoRepository>;

  constructor() {
    this.repository = new TodoRepository();
  }

  /**
   * Get all todos
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  all = async (
    req: Request & Record<string, any>,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const userId = req.user;
      const todos = await this.repository.all(userId);

      return this.response(res).successResponse(todos);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single todo
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  single = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { todoId } = req.params;

      if (!todoId) {
        return this.response(res).errorResponse(
          "The todoId param is not exists",
          400
        );
      }

      const todo = await this.repository.single(todoId);

      if (todo === null) {
        return this.response(res).errorResponse(
          "There is no todo with the provided ID",
          404
        );
      }

      return this.response(res).successResponse(todo);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new Todo
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  create = async (
    req: Request & Record<string, any>,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const userId = req.user;
      if (!req.body.title) {
        return this.response(res).errorResponse("The title is required", 400);
      }

      const todoData: TodoSchema = {
        ownerId: userId,
        title: req.body.title,
        body: req.body.content || null,
      };

      if (req.files) {
        const uploadFile = new HandleFileUpload();
        const thumbnail = await uploadFile.save(req, res);
        if (typeof thumbnail === "string") {
          todoData.thumbnail = thumbnail;
        }
      }
      const todo = await this.repository.create(todoData);

      return this.response(res).setCode(201).successResponse({ todo });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing todo
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { todoId } = req.params;

      if (!todoId) {
        return this.response(res).errorResponse(
          "The todoId param is not exists",
          400
        );
      }

      if (req.files) {
        const uploadFile = new HandleFileUpload();
        const thumbnail = await uploadFile.save(req, res);
        if (typeof thumbnail === "string") {
          req.body.thumbnail = thumbnail;
        }
      }

      const todo = await this.repository.edit(todoId, req.body);

      return this.response(res).setCode(204).successResponse({ todo });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete an existing todo
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  destroy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { todoId } = req.params;

      if (!todoId) {
        return this.response(res).errorResponse(
          "The todoId param is not exists",
          400
        );
      }

      await this.repository.destroy(todoId);

      return this.response(res).successResponse({ message: "Todo deleted!" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark todo as done or not done yet
   *
   * @param {Request} req Http Incoming Request
   * @param {Response} res Http Outgoing Response
   * @param {NextFunction} next Next function to pass the error to the error middleware
   * @returns {Promise<Response | void>} Http Response or throws an error and pass it with next function
   */
  completed = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const { todoId } = req.params;

      if (!todoId) {
        return this.response(res).errorResponse(
          "The todoId param is not exists",
          400
        );
      }
      await this.repository.completed(todoId, req.body.isDone);
      const message = req.body.isDone
        ? "Todo marked as completed"
        : "Todo marked as uncompleted";

      return this.response(res).successResponse({ message });
    } catch (error) {
      next(error);
    }
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

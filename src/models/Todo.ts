import { Todo as TodoTable } from "../db";
import { TodoModelInterface, TodoSchema } from "../types";

export class TodoModel implements TodoModelInterface {
  private model: typeof TodoTable;

  constructor() {
    this.model = TodoTable;
  }

  all = async (ownerId: string): Promise<TodoSchema[] | []> => {
    const todos = (await this.model.findAll({
      where: { ownerId },
    })) as unknown as TodoSchema[];

    return todos;
  };

  single = async (todoId: string): Promise<TodoSchema | null> => {
    const todo = (await this.getOne(todoId)) as unknown as TodoSchema;
    return todo;
  };

  create = async (todo: TodoSchema): Promise<TodoSchema> => {
    const createdTodo = (await this.model.create(
      todo
    )) as unknown as TodoSchema;
    return createdTodo;
  };

  edit = async (
    todoId: string,
    todo: Partial<TodoSchema>
  ): Promise<Record<string, any> | null> => {
    const currentTodo = await this.getOne(todoId);

    if (currentTodo === null) {
      return null;
    }

    const updatedTodo = await currentTodo.update(todo);

    return updatedTodo;
  };

  destroy = async (todoId: string): Promise<boolean | never> => {
    const todo = await this.getOne(todoId);

    if (todo === null) {
      throw new Error("There is no todo with the provided ID");
    }

    await todo.destroy();

    return true;
  };

  completed = async (
    todoId: string,
    isDone: boolean
  ): Promise<Record<string, any> | null> => {
    const todo = await this.getOne(todoId);

    if (todo === null) {
      return null;
    }

    const todoStatus = await todo.update({ isDone });

    return todoStatus;
  };

  private getOne = async (todoId: string) => {
    const todo = await this.model.findOne({ where: { todoId } });

    if (todo === null) {
      return null;
    }

    return todo;
  };
}

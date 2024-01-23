import { TodoModel } from "../models";
import { TodoModelInterface, TodoSchema } from "../types";

export class TodoRepository implements TodoModelInterface {
  private model: InstanceType<typeof TodoModel>;

  constructor() {
    this.model = new TodoModel();
  }

  all = async (ownerId: string): Promise<TodoSchema[] | []> => {
    const todos = await this.model.all(ownerId);

    return todos;
  };

  single = async (todoId: string): Promise<TodoSchema | null> => {
    const todo = await this.model.single(todoId);
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
    const updatedTodo = await this.model.edit(todoId, todo);
    return updatedTodo;
  };

  destroy = async (todoId: string): Promise<boolean | never> => {
    const deleteTodo = await this.model.destroy(todoId);
    return deleteTodo;
  };

  completed = async (
    todoId: string,
    isDone: boolean
  ): Promise<Record<string, any> | null> => {
    const todo = await this.model.completed(todoId, isDone);
    return todo;
  };
}

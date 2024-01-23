import { Model, Op } from "sequelize";

import { User as UserTable } from "../db";
import { TodoRepository } from "../repositories";
import {
  UserModelInterface,
  UserSchema,
  UserFilter,
  UniqueUserFields,
} from "../types";

export class UserModel implements UserModelInterface {
  private model: typeof UserTable;

  private todoRepository: InstanceType<typeof TodoRepository>;

  constructor() {
    this.model = UserTable;
    this.todoRepository = new TodoRepository();
  }

  single = async (filter: UserFilter): Promise<Partial<UserSchema> | null> => {
    const user = await this.getOne(filter);

    if (user === null) return null;

    const todos = await this.todoRepository.all(user.getDataValue("userId"));
    const userWithTodos = user as Partial<UserSchema>;

    userWithTodos.todos = todos;

    return userWithTodos;
  };

  create = async (user: UserSchema): Promise<Record<string, any> | never> => {
    const createdUser = (await this.model.create(user)) as Partial<UserSchema>;

    return {
      userId: createdUser.userId,
      name: createdUser.fullName,
      username: createdUser.username,
      email: createdUser.email,
    };
  };

  update = async (
    user: Partial<UserSchema>,
    filter: UserFilter
  ): Promise<Record<string, any> | null> => {
    const currentUser = await this.getOne(filter);

    if (currentUser === null) return null;

    const updatedUser = await currentUser.update(user);

    return updatedUser;
  };

  destroy = async (filter: UserFilter): Promise<boolean> => {
    const user = await this.getOne(filter);

    if (user === null) {
      throw new Error("No user on the DB");
    }

    await user.destroy();

    return true;
  };

  updateRefreshToken = async (
    filter: Record<string, any>,
    token: string
  ): Promise<string | null> => {
    const user = await this.getOne(filter);

    if (user === null) {
      return null;
    }

    const update = await user.update({
      refreshToken: token,
    });

    return update.getDataValue("refreshToken");
  };

  exists = async (
    fields?: UniqueUserFields,
    userId?: string,
    isNew: boolean = true
  ): Promise<boolean | never> => {
    let isExists: boolean = false;
    if (isNew) {
      isExists = await this.checkExistenceOnCreate(fields!);
      return isExists;
    }

    isExists = await this.checkExistenceOnEdit(userId!, fields!);
    return isExists;
  };

  private getOne = async (
    filter: UserFilter
  ): Promise<Model<any, any> | null> => {
    const user = await this.model.findOne({ where: filter });

    if (user === null) {
      return null;
    }

    return user;
  };

  private checkExistenceOnEdit = async (
    userId: string,
    fields?: UniqueUserFields
  ): Promise<boolean | never> => {
    const userById = await this.getOne({ userId });

    if (userById === null) {
      throw new Error("There is no user with the provided userId");
    }

    if (fields !== undefined) {
      const filter = {
        [Op.or]: [
          fields?.username && { username: fields?.username },
          fields?.email && { email: fields?.email },
        ],
      } as UserFilter;
      const user = await this.getOne(filter);

      return user !== null;
    }

    return false;
  };

  private checkExistenceOnCreate = async (
    fields: UniqueUserFields
  ): Promise<boolean> => {
    const { username, email } = fields;
    const filter = { [Op.or]: [{ username }, { email }] } as UserFilter;
    const user = await this.getOne(filter);

    return user !== null;
  };
}

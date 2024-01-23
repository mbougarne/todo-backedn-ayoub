import { UserModel } from "../models";
import {
  UserModelInterface,
  UserSchema,
  UserFilter,
  UniqueUserFields,
} from "../types";

export class UserRepository implements UserModelInterface {
  private model: InstanceType<typeof UserModel>;

  constructor() {
    this.model = new UserModel();
  }

  single = async (filter: UserFilter): Promise<Partial<UserSchema> | null> => {
    const user = await this.model.single(filter);
    return user;
  };

  create = async (user: UserSchema): Promise<Record<string, any> | never> => {
    const createdUser = await this.model.create(user);
    return createdUser;
  };

  update = async (
    user: Partial<UserSchema>,
    filter: UserFilter
  ): Promise<Record<string, any> | null> => {
    const updatedUser = await this.model.update(user, filter);
    return updatedUser;
  };

  destroy = async (filter: UserFilter): Promise<boolean> => {
    const isDestroyed = await this.model.destroy(filter);
    return isDestroyed;
  };

  saveRefreshToken = async (
    filter: Record<string, any>,
    token: string
  ): Promise<string | null> => {
    const refreshToken = await this.model.updateRefreshToken(filter, token);
    return refreshToken;
  };

  exists = async (
    fields?: UniqueUserFields,
    userId?: string,
    isNew: boolean = true
  ): Promise<boolean | never> => {
    const isExists = await this.model.exists(fields, userId, isNew);
    return isExists;
  };
}

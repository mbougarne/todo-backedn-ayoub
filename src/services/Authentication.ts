/* eslint-disable class-methods-use-this */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dataEncryption } from "./DataEncryption";

import { JWT_CONFIGS } from "../config";
import { GeneratedTokenPayload, JwtVerifyReturn } from "../types";

class Authentication {
  hashPassword = async (password: string): Promise<string> => {
    const hashed = await bcrypt.hash(password, 8);
    return hashed;
  };

  verifyPassword = async (plain: string, hashed: string): Promise<boolean> => {
    const isValid = await bcrypt.compare(plain, hashed);
    return isValid;
  };

  token = (user: GeneratedTokenPayload): string => {
    const token = this.generateJWTTokens(
      user,
      JWT_CONFIGS.ACCESS_TOKEN_SECRET!,
      "11m"
    );
    return token;
  };

  refreshToken = (user: GeneratedTokenPayload): string => {
    const refresh = this.generateJWTTokens(
      user,
      JWT_CONFIGS.REFRESH_TOKEN_SECRET!,
      "30d"
    );

    return dataEncryption.encryptData(refresh);
  };

  validateRefresh = (token: string): JwtVerifyReturn => {
    const decodeToken = dataEncryption.decryptData(token.trim().toString());
    const validate = this.validateTokens(
      decodeToken,
      JWT_CONFIGS.REFRESH_TOKEN_SECRET!
    );

    return validate;
  };

  validateAccess = (token: string): JwtVerifyReturn => {
    const validate = this.validateTokens(
      token,
      JWT_CONFIGS.ACCESS_TOKEN_SECRET!
    );

    return validate;
  };

  private validateTokens = (token: string, secret: string): JwtVerifyReturn => {
    let result: JwtVerifyReturn;

    jwt.verify(token, secret!, (err, data) => {
      if (err) {
        result = {
          isError: true,
          errorName: err.name,
        };
      } else {
        result = data;
      }
    });

    return result;
  };

  private generateJWTTokens = (
    payload: GeneratedTokenPayload,
    secret: string,
    expiresIn: string
  ): string => {
    const token = jwt.sign({ payload }, secret!, { expiresIn });
    return token;
  };
}

export const authentication = new Authentication();

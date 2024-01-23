import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

import { JWT_CONFIGS } from "../config";

class DataEncryption {
  private key: string;

  private iv: Buffer;

  private fromBuffer: typeof Buffer.from;

  private concatBuffer: typeof Buffer.concat;

  constructor() {
    this.key = JWT_CONFIGS.ENCRYPTION_KEY!;
    this.iv = randomBytes(16);
    this.fromBuffer = Buffer.from;
    this.concatBuffer = Buffer.concat;
  }

  encryptData = (data: any) => {
    const createdCipher = createCipheriv(
      "aes-256-cbc",
      this.fromBuffer(this.key, "hex"),
      this.iv
    );
    const encrypted = this.concatBuffer([
      createdCipher.update(data),
      createdCipher.final(),
    ]).toString("hex");
    const ivToHex = this.iv.toString("hex");

    return `${ivToHex}::${encrypted}`;
  };

  decryptData = (data: any) => {
    let [decIv, encrypted] = data.split("::");

    decIv = this.fromBuffer(decIv, "hex");
    encrypted = this.fromBuffer(encrypted, "hex");

    const createdDecipher = createDecipheriv(
      "aes-256-cbc",
      this.fromBuffer(this.key, "hex"),
      decIv
    );

    return this.concatBuffer([
      createdDecipher.update(encrypted),
      createdDecipher.final(),
    ]).toString();
  };
}

export const dataEncryption = new DataEncryption();

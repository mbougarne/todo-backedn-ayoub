/* eslint-disable class-methods-use-this */
import path from "path";
import { createHash } from "crypto";
import { Request, Response } from "express";
import { FileArray, UploadedFile } from "express-fileupload";
import { getExtension } from "mime";

import { HttpResponses } from "./HttpResponses";

export class HandleFileUpload {
  private handleUpload = async (
    req: Request,
    res: Response
  ): Promise<Response | string> => {
    const files = req.files as FileArray;

    if (!files || !Object.keys(files)) {
      return new HttpResponses(res).errorResponse(
        "There is no file attached to the request",
        400
      );
    }

    const thumbnail = files.thumbnail as UploadedFile;
    let renamed = this.renameUploadedFile(thumbnail);

    if (renamed === 400) {
      return new HttpResponses(res).errorResponse(
        "The mimetype or name is not set",
        400
      );
    }

    if (renamed === 415) {
      const message = `The ${thumbnail.name.slice(
        thumbnail.name.indexOf(".") + 1
      )} extension is not allowed`;
      return new HttpResponses(res).errorResponse(message, 415);
    }

    renamed = renamed.toString();

    const uploadPath = this.getStoredPath(renamed);
    await thumbnail.mv(uploadPath);

    return renamed;
  };

  save = async (req: Request, res: Response): Promise<Response | string> => {
    const savedThumbnail = await this.handleUpload(req, res);
    return savedThumbnail;
  };

  private renameUploadedFile = (file: any): string | number => {
    const { mimetype, name } = file;

    if (!mimetype || !name) {
      return 400;
    }

    const allowedExtension = ["png", "jpg", "jpeg"];
    const ext = getExtension(mimetype);

    if (!allowedExtension.includes(ext!)) {
      return 415;
    }

    const nameToHash = name.slice(0, name.indexOf(".")) + Date.now().toString();
    const hashedName = createHash("md5").update(nameToHash).digest("hex");

    return `${hashedName}.${ext}`;
  };

  private getStoredPath = (filename: string) =>
    path.join(__dirname, `../static/uploads/${filename}`);
}

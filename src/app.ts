import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import expressFileUpload from "express-fileupload";
import {
  errorMiddleware,
  notFoundMiddleware,
  authRefresh,
  verifyAuthentication,
} from "./middlewares";
import { TodoRoutes, UserRoutes } from "./routes";

const app = express();

const fileUploadOptions = {
  limits: { fileSize: 5 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: "/tmp/",
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: true,
  abortOnLimit: true,
};

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressFileUpload(fileUploadOptions));
app.use(
  "/static",
  express.static(path.join(__dirname, "static/uploads"), {
    // eslint-disable-next-line no-shadow, no-unused-vars
    setHeaders: function setHeaders(res, path, stat) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET");
      res.header("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

app.use([verifyAuthentication, authRefresh]);

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/todos", TodoRoutes);

app.use(errorMiddleware);
app.use("*", notFoundMiddleware);

export default app;

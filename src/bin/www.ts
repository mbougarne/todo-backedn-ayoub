import { createServer } from "http";
import { APP_CONFIGS } from "../config";
import app from "../app";

const { log, error } = console;

const server = createServer(app);
const PORT = APP_CONFIGS.APP_PORT;
const HOST = APP_CONFIGS.APP_HOST;
const ENV_MODE = APP_CONFIGS.APP_MODE;

app.set("port", PORT);
app.set("host", HOST);

/**
 * Event listener for HTTP server "error" event.
*/
const onError = (err: { syscall: string; code: any }) => {
  if (err.syscall !== "listen") {
    throw err;
  }

  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (err.code) {
    case "EACCES":
      error(`${bind} requires elevated privileges`);
      process.exit(0);
    // eslint-disable-next-line no-fallthrough
    case "EADDRINUSE":
      error(`${bind} is already in use`);
      process.exit(0);
    // eslint-disable-next-line no-fallthrough
    default:
      throw err;
  }
};

server.on("connection", () =>
  log(`Connected and running on ${HOST}:${PORT} with ${ENV_MODE} mode`)
);
server.on("listening", () =>
  log(`Listening on ${HOST}:${PORT} with ${ENV_MODE} mode`)
);
server.on("error", onError);
server.listen(PORT);

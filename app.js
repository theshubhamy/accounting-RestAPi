import express from "express";
import path from "path";
import cluster from "cluster";
import os from "os";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import sequelize from "./utils/database.js";
import approutes from "./routes/route.js";
//all error controllers imported here
import { corsError } from "./middleware/error-handlers/cors-error.js";
import { centralError } from "./middleware/error-handlers/central-error.js";
const app = express();
const cpu = os.cpus().length;

if (process.env.NODE_ENV) {
  dotenv.config();
}

const port = process.env.PORT || 3300;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < cpu; i++) {
    cluster.fork();
  }
  console.log(cpu);
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  app.use(corsError);
  //defining absolute path of current WORKDIR
  const __dirname = path.resolve();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(__dirname));
  app.use(express.static(path.join(__dirname, "public")));
  // Routes
  // app
  app.get("/", (req, res) => {
    res.status(200).json({
      msg: "Server is running🔥🔥🔥",
    });
  });
  app.use("/app", approutes);
  // Database connection
  app.use(helmet());
  app.use(compression());

  //central error handler here
  app.use(centralError);
  sequelize
    .sync()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

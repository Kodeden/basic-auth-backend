import express from "express";
import config from "./config.js";
import handleError from "./middleware/handle-error.js";
import usersRoutes from "./user/routes.js";
import cors from "cors";

export const setupServer = () => {
  const app = express();

  // Enable CORS for all routes ⚠️
  app.use(cors());
  app.use(express.json());

  app.use("/users", usersRoutes);
  app.use(handleError);

  return app;
};

export default () => {
  setupServer().listen(config.port, () => {
    console.info(`Server 🏃🏾‍♂️ at:  http://localhost:${config.port}`);
  });
};

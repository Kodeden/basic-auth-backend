import express from "express";
import config from "./config.js";
import handleError from "./middleware/handle-error.js";
import usersRoutes from "./users/routes.js";

const app = express();

app.use(express.json());

app.use("/users", usersRoutes);
app.use(handleError);

export default () => {
  app.listen(config.port, () => {
    console.info(`Server 🏃🏾‍♂️ at:  http://localhost:${config.port}`);
  });
};

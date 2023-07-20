import express, { RequestHandler } from "express";
import userRoutes from "./routes/userRouter";
import datasetRoutes from "./routes/datasetsRouter";
import connection from "./db/config";
import { json, urlencoded } from "body-parser";
import "dotenv/config";
import cors from "cors";
import https from "https";
import fileUpload from "express-fileupload";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload());
//apis
app.get("/", (req, res) => {
  res.status(200).send("Server is running...");
});
app.use("/api", [userRoutes, datasetRoutes]);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(500).json({ message: err.message });
  }
);

connection
  .sync()
  .then(() => {
    console.log("Database successfully connected");
  })
  .catch((err) => {
    console.log("Error", err);
  });

app.listen(process.env.PORT ?? 443, () => {
  console.log(`Server stated on port ${process.env.PORT ?? 443}`);
});

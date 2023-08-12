import express, { RequestHandler } from "express";
import userRoutes from "./routes/authRouter";
import datasetRoutes from "./routes/datasetsRouter";
import dbscanRoutes from "./routes/dbscanRouter";
import fileRoutes from "./routes/filesRouter";
import connection from "./db/config";
import { json, urlencoded } from "body-parser";
import "dotenv/config";
import cors from "cors";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload());

// Define swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "AutoDBSCAN API Documentation",
      version: "1.0.0",
      description:
        "Welcome to the comprehensive guide for our AutoDBSCAN API Documentation. This space provides extensive information about each of our available endpoints. Not only can you delve into the specific details of every endpoint, but you also have the unique opportunity to test them interactively, right from here. Immerse yourself in the seamless experience of understanding and implementing advanced clustering solutions with AutoDBSCAN API.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT ?? 443}`,
      },
    ],
    components: {
      // add this
      schemas: {
        DatasetChunk: {
          type: "object",
          properties: {
            header: {
              type: "array",
              items: { type: "string" },
              description: "The column names of the dataset.",
            },
            numericalHeaders: {
              type: "array",
              items: { type: "string" },
              description: "The names of columns that have numerical data.",
            },
            content: {
              type: "array",
              items: { type: "string" },
              description: "The actual data from the dataset.",
            },
            totalPages: {
              type: "integer",
              description:
                "The total number of pages of data that can be fetched from the dataset.",
            },
            totalChunks: {
              type: "integer",
              description:
                "The total number of chunks in which the dataset has been divided.",
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "/routes/*.js"),
    path.join(__dirname, "/controllers/*.js"),
  ], // files containing annotations as above
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//apis
app.get("/", (req, res) => {
  res.status(200).send("Server is running...");
});
app.use("/api", [userRoutes, datasetRoutes, dbscanRoutes, fileRoutes]);

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

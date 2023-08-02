import { RequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import fs, { createReadStream } from "fs";
import path from "path";
import { User } from "../models/user";
import util from "util";

const csvFolder = path.join(__dirname, "..", "..", "/datasets/public");
const tempFolder = path.join(__dirname, "..", "..", "/datasets/temp");

/**
 * @openapi
 * /api/fetchPublicDatasets:
 *   get:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Fetch all public datasets
 *     description: This endpoint retrieves all public datasets available in the CSV folder.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of public datasets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: The name of the dataset (CSV file).
 *       500:
 *         description: Internal Server Error.
 */
export const fetchPublicDatasets: RequestHandler = async (req, res) => {
  fs.readdir(csvFolder, (err, files) => {
    if (err) {
      console.error("Error reading CSV folder:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Filter out non-CSV files
    const csvFiles = files.filter((file) => file.endsWith(".csv"));

    res.status(200).json(csvFiles);
  });
};
/**
 * @openapi
 * /api/fetchPrivateDatasets:
 *   get:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Fetch all private datasets for a specific user
 *     description: This endpoint retrieves all private datasets available for a specific user. User is determined by the decoded email in the request body.
 *     parameters:
 *       - name: email
 *         in: body
 *         description: Email of the user
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of private datasets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: The name of the dataset (CSV file).
 *       400:
 *         description: Bad request. Could not find user.
 *       500:
 *         description: Internal Server Error.
 */
export const fetchPrivateDatasets: RequestHandler = async (req, res) => {
  if (req.body.decoded && req.body.decoded.email) {
    const user = await User.findByPk(req.body.decoded.email);
    if (user) {
      const folderPath = path.join(
        __dirname,
        "..",
        "..",
        `/datasets/private/${user.apiKey}`
      );
      if (fs.existsSync(folderPath)) {
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            console.error("Error reading CSV folder:", err);
            return res.status(500).send("Internal Server Error");
          }

          // Filter out non-CSV files
          const csvFiles = files.filter((file) => file.endsWith(".csv"));
          res.status(200).json(csvFiles);
        });
      } else res.status(200).json([]);
    } else {
      return res.status(400).send("Could not find user");
    }
  } else {
    return res.status(400).send("Could not find user");
  }
};

/**
 * @openapi
 * /api/fetchPublicDataset:
 *   get:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Fetch a chunk of a public dataset
 *     description: This endpoint retrieves a chunk of a public dataset available in the CSV folder. It paginates the dataset based on chunk index and page size.
 *     parameters:
 *       - name: isTempDataset
 *         in: query
 *         description: Indicates if the dataset is a temporary dataset
 *         required: true
 *         schema:
 *           type: string
 *       - name: filename
 *         in: query
 *         description: The name of the dataset file
 *         required: true
 *         schema:
 *           type: string
 *       - name: chunkIndex
 *         in: query
 *         description: The index of the chunk to fetch
 *         required: true
 *         schema:
 *           type: integer
 *       - name: pageSize
 *         in: query
 *         description: The size of each page in the chunk
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the dataset chunk.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatasetChunk'
 *       500:
 *         description: Internal Server Error.
 */
export const fetchPublicDataset: RequestHandler = (req, res) => {
  const isTempDataset = req.query.isTempDataset as string;
  const filename = req.query.filename as string;
  const chunkIndex = parseInt(req.query.chunkIndex as string, 10) || 0; // Get the chunk index from the query parameter
  const chunkSize = 3; // Number of pages per chunk
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Get the page size from the query parameter

  const filePath = path.join(
    isTempDataset === "true" ? tempFolder : csvFolder,
    filename
  );

  const fileStream = createReadStream(filePath, "utf8");
  let rowData: (string | Buffer)[] = [];

  fileStream
    .on("data", (chunk) => {
      rowData.push(chunk);
    })
    .on("end", () => {
      const data = rowData.join("").split("\n");
      const header = data[0].split(",");

      const content = data.slice(1);

      const first1000Rows = content.slice(1, 1000);
      const numericalHeaders = header.filter((_, columnIndex) => {
        return first1000Rows.every(
          (row) => !isNaN(Number(row.split(",")[columnIndex]))
        );
      });
      const totalRows = content.length;
      const totalPages = Math.ceil(totalRows / pageSize);

      const startIndex = chunkIndex * chunkSize * pageSize;
      const endIndex = Math.min(startIndex + chunkSize * pageSize, totalRows);

      const paginatedContent = content.slice(startIndex, endIndex);

      const paginatedData = {
        header,
        numericalHeaders,
        content: paginatedContent,
        totalPages,
        totalChunks: Math.ceil(totalPages / chunkSize),
      };

      res.json(paginatedData);
    })
    .on("error", (err) => {
      console.error("Error reading CSV file:", err);
      res.status(500).send("Internal Server Error");
    });
};

/**
 * @openapi
 * /api/fetchPrivateDataset:
 *   get:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Fetch a chunk of a private dataset
 *     description: This endpoint retrieves a chunk of a private dataset for a specific user. It paginates the dataset based on chunk index and page size. User is determined by the decoded email in the request body.
 *     parameters:
 *       - name: filename
 *         in: query
 *         description: The name of the dataset file
 *         required: true
 *         schema:
 *           type: string
 *       - name: chunkIndex
 *         in: query
 *         description: The index of the chunk to fetch
 *         required: true
 *         schema:
 *           type: integer
 *       - name: pageSize
 *         in: query
 *         description: The size of each page in the chunk
 *         required: true
 *         schema:
 *           type: integer
 *       - name: email
 *         in: body
 *         description: Email of the user
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the dataset chunk.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatasetChunk'
 *       400:
 *         description: Bad request. User not found.
 *       500:
 *         description: Internal Server Error.
 */
export const fetchPrivateDataset: RequestHandler = async (req, res) => {
  const filename = req.query.filename as string;
  const chunkIndex = parseInt(req.query.chunkIndex as string, 10) || 0; // Get the chunk index from the query parameter
  const chunkSize = 3; // Number of pages per chunk
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Get the page size from the query parameter

  if (req.body.decoded && req.body.decoded.email) {
    const user = await User.findByPk(req.body.decoded.email);
    if (user) {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        `/datasets/private/${user.apiKey}`,
        filename
      );
      const fileStream = createReadStream(filePath, "utf8");
      let rowData: (string | Buffer)[] = [];

      fileStream
        .on("data", (chunk) => {
          rowData.push(chunk);
        })
        .on("end", () => {
          const data = rowData.join("").split("\n");
          const header = data[0].split(",");

          const content = data.slice(1);

          const first1000Rows = content.slice(1, 1000);
          const numericalHeaders = header.filter((_, columnIndex) => {
            return first1000Rows.every(
              (row) => !isNaN(Number(row.split(",")[columnIndex]))
            );
          });
          const totalRows = content.length;
          const totalPages = Math.ceil(totalRows / pageSize);

          const startIndex = chunkIndex * chunkSize * pageSize;
          const endIndex = Math.min(
            startIndex + chunkSize * pageSize,
            totalRows
          );

          const paginatedContent = content.slice(startIndex, endIndex);

          const paginatedData = {
            header,
            numericalHeaders,
            content: paginatedContent,
            totalPages,
            totalChunks: Math.ceil(totalPages / chunkSize),
          };

          res.json(paginatedData);
        })
        .on("error", (err) => {
          console.error("Error reading CSV file:", err);
          res.status(500).send("Internal Server Error");
        });
    }
  } else {
    return res.status(400).send("User not found");
  }
};

/**
 * @openapi
 * /api/datasets/deleteDataset:
 *   delete:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Delete a dataset
 *     description: This endpoint deletes a dataset for a particular user.
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file to delete.
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *         required: true
 *         description: Type of the file (public or private).
 *     responses:
 *       200:
 *         description: Successfully deleted the file.
 *       400:
 *         description: Could not find user.
 *       500:
 *         description: Something went wrong or Internal Server Error.
 */
const unlinkAsync = util.promisify(fs.unlink);
export const deleteDataset: RequestHandler = async (req, res) => {
  if (req.body.decoded && req.body.decoded.email) {
    const user = await User.findByPk(req.body.decoded.email);
    if (user) {
      const filename = req.query.filename as string;
      const fileType = req.query.fileType as string;
      if (fileType === "public" && user.publicAccess) {
        const filepath = path.join(csvFolder, filename);
        await unlinkAsync(filepath)
          .then(() => {
            return res.status(200).send("Successfully deleted file");
          })
          .catch(() => {
            return res.status(500).send("Something went wrong");
          });
      } else {
        const filepath = path.join(
          __dirname,
          "..",
          "..",
          `/datasets/private/${user.apiKey}`,
          filename
        );
        await unlinkAsync(filepath)
          .then(() => {
            return res.status(200).send("Successfully deleted file");
          })
          .catch(() => {
            return res.status(500).send("Something went wrong");
          });
      }
    } else {
      return res.status(400).send("Could not find user");
    }
  } else {
    return res.status(400).send("Could not find user");
  }
};

/**
 * @openapi
 * /api/datasets/downloadDataset:
 *   get:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Download a dataset
 *     description: This endpoint allows a user to download a dataset.
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file to download.
 *       - in: query
 *         name: isTempDataset
 *         schema:
 *           type: string
 *         required: true
 *         description: Boolean value specifying if the dataset is a temporary dataset.
 *     responses:
 *       200:
 *         description: Successfully downloaded the file.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal Server Error.
 */
export const downloadDataset: RequestHandler = (req, res) => {
  const isTempDataset = req.query.isTempDataset as string;
  const filename = req.query.filename as string;

  const filePath = path.join(
    isTempDataset === "true" ? tempFolder : csvFolder,
    filename
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  const fileStream = createReadStream(filePath);
  fileStream.pipe(res);
};

/**
 * @openapi
 * /api/datasets/uploadDataset:
 *   post:
 *     tags:
 *       - "Dataset Manipulation"
 *     summary: Upload a dataset
 *     description: This endpoint allows a user to upload a dataset.
 *     parameters:
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: string
 *         required: true
 *         description: Boolean value specifying if the dataset is public.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *       400:
 *         description: No file uploaded or Could not find user.
 *       500:
 *         description: Internal Server Error.
 */
export const uploadDataset: RequestHandler = async (req, res) => {
  const file = req.files?.file as UploadedFile | undefined;
  const isPublic = req.query.isPublic as string;

  if (!file) {
    res.status(400).send("No file uploaded");
    return;
  }
  const filename = file.name;

  if (req.body.decoded && req.body.decoded.email) {
    const user = await User.findByPk(req.body.decoded.email);
    if (user) {
      let folderPath: string;
      if (isPublic === "true" && user.publicAccess) {
        folderPath = csvFolder;
      } else {
        folderPath = path.join(
          __dirname,
          "..",
          "..",
          `/datasets/private/${user.apiKey}`
        );
      }
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Directory created: ${folderPath}`);
      }

      const uploadPath = path.join(folderPath, filename);

      file.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          res.status(500).send("Internal Server Error");
        } else {
          res.status(200).send("File uploaded successfully");
        }
      });
    } else {
      return res.status(400).send("Could not find user");
    }
  } else {
    return res.status(400).send("Could not find user");
  }
};

import { spawn } from "child_process";
import { RequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import fs, { createReadStream } from "fs";
import path from "path";
import { User } from "../models/user";
import util from "util";

const csvFolder = path.join(__dirname, "..", "..", "/datasets/public");
const tempFolder = path.join(__dirname, "..", "..", "/datasets/temp");
const pythonScriptsFolder = path.join(__dirname, "..", "..", "/python");

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
        // fs.unlink(filepath, (err) => {
        //   if (err) {
        //     console.error("Error deleting file:", err);

        //   } else {
        //     console.log('deleted')
        //   }
        // });
      } else {
        const filepath = path.join(
          __dirname,
          "..",
          "..",
          `/datasets/private/${user.apiKey}`,
          filename
        );
        // fs.unlink(filepath, (err) => {
        //   if (err) {
        //     console.error("Error deleting file:", err);

        //   } else {
        //     console.log('deleted')
        //   }
        // });
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

export const deleteTempFiles: RequestHandler = (req, res) => {
  const tempFileNames = req.body.tempFileNames as string[];

  if (tempFileNames && tempFileNames.length > 0) {
    const deletePromises = tempFileNames.map((fileName) => {
      const tempImageFilePath = path.join(tempFolder, fileName);
      return new Promise<void | string>((resolve) => {
        fs.unlink(tempImageFilePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            resolve(fileName); // Resolve with fileName when deletion fails
          } else {
            resolve(); // Resolve without any value when deletion succeeds
          }
        });
      });
    });

    Promise.all(deletePromises)
      .then((deletedFiles) => {
        const filesNotDeleted = deletedFiles.filter((fileName) => fileName); // Filter out resolved promises (successful deletions)
        if (filesNotDeleted.length === 0) {
          console.log("All files deleted successfully");
          return res.status(200).send({
            message: "Successfully deleted all files",
            filesNotDeleted: filesNotDeleted,
          });
        } else {
          console.log(
            "Files not deleted:",
            filesNotDeleted.length,
            filesNotDeleted
          );
          return res.status(500).send({
            message: "Could not delete all files",
            filesNotDeleted: filesNotDeleted,
          });
        }
      })
      .catch((error) => {
        console.error("Error deleting files:", error);
        return res.status(500).send({
          message: "Could not delete files",
          filesNotDeleted: tempFileNames,
        });
      });
  } else {
    return res.status(500).send("Could not process request");
  }
};

export const findEpsilonAsGuest: RequestHandler = (req, res) => {
  const tempImageFilename = `temp_${Date.now()}-${Math.random()}.png`;
  const dataset_name = req.query.dataset_name as string;
  const k = req.query.k as string;
  const columns = req.query.columns as string;

  const tempImageFilePath = path.join(tempFolder, tempImageFilename);
  const args: string[] = [
    path.join(csvFolder, dataset_name),
    tempImageFilePath,
    k,
    columns,
  ];

  const pythonProcess = spawn("python3", [
    path.join(pythonScriptsFolder, "eps_calculator.py"),
    ...args,
  ]);
  let epsilon: string;
  pythonProcess.stdout.on("data", (data) => {
    epsilon = data.toString().trim().split("\n")[0];
  });

  // Wait for the Python script to complete
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.send({ epsilon, plotImage: tempImageFilename });
    } else {
      res.status(500).json({ error: "An error occurred on python script" });
    }
  });
};

export const fetchPlotImage: RequestHandler = (req, res) => {
  const filename = req.query.filename as string;
  const tempImageFilePath = path.join(tempFolder, filename);
  if (fs.existsSync(tempImageFilePath)) {
    res.sendFile(tempImageFilePath, {}, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      } else {
        // Deleting the image file
        fs.unlink(tempImageFilePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      }
    });
  } else {
    res.status(500).send("No such file or directory");
  }
};

export const applyDBSCAN: RequestHandler = (req, res) => {
  const dataset_name = req.query.dataset_name as string;
  const epsilon = req.query.epsilon as string;
  const min_samples = req.query.min_samples as string;
  const columns = req.query.columns as string;

  const generatedDatasetFileName = `temp_${Date.now()}-${Math.random()}.csv`;
  const generatedDatasetFilePath = path.join(
    tempFolder,
    generatedDatasetFileName
  );

  const args: string[] = [
    path.join(csvFolder, dataset_name),
    generatedDatasetFilePath,
    epsilon,
    min_samples,
    columns,
  ];

  const pythonProcess = spawn("python3", [
    path.join(pythonScriptsFolder, "dbscan.py"),
    ...args,
  ]);

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.send({ generatedDatasetFileName });
    } else {
      res.status(500).json({ error: "An error occurred on python script" });
    }
  });
};

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

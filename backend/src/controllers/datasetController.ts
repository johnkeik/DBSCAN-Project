import { spawn } from "child_process";
import { RequestHandler } from "express";
import fs, { createReadStream } from "fs";
import path from "path";

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

export const fetchDataset: RequestHandler = (req, res) => {
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

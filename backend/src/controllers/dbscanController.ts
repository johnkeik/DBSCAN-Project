import { spawn } from "child_process";
import { RequestHandler } from "express";
import path from "path";

const csvFolder = path.join(__dirname, "..", "..", "/datasets/public");
const tempFolder = path.join(__dirname, "..", "..", "/datasets/temp");
const pythonScriptsFolder = path.join(__dirname, "..", "..", "/python");

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

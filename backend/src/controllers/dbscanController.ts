import { spawn } from "child_process";
import { RequestHandler } from "express";
import path from "path";
import pidusage from "pidusage";


const csvFolder = path.join(__dirname, "..", "..", "/datasets/public");
const tempFolder = path.join(__dirname, "..", "..", "/datasets/temp");
const pythonScriptsFolder = path.join(__dirname, "..", "..", "/python");

/**
 * @openapi
 * /api/findEpsilonAsGuest:
 *   get:
 *     tags:
 *       - Clustering Analysis Endpoints
 *     summary: Calculate Epsilon
 *     description: This endpoint calculates epsilon for DBSCAN clustering.
 *     parameters:
 *       - in: query
 *         name: dataset_name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the dataset.
 *       - in: query
 *         name: k
 *         schema:
 *           type: string
 *         required: true
 *         description: The k value for K-nearest neighbours in DBSCAN.
 *       - in: query
 *         name: columns
 *         schema:
 *           type: string
 *         required: true
 *         description: Columns to be considered in the dataset.
 *     responses:
 *       200:
 *         description: Epsilon value and plot image.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 epsilon:
 *                   type: string
 *                 plotImage:
 *                   type: string
 *       500:
 *         description: An error occurred on python script.
 */
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

/**
 * @openapi
 * /api/applyDBSCAN:
 *   get:
 *     tags:
 *       - Clustering Analysis Endpoints
 *     summary: Apply DBSCAN
 *     description: This endpoint applies DBSCAN clustering on a dataset.
 *     parameters:
 *       - in: query
 *         name: dataset_name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the dataset.
 *       - in: query
 *         name: epsilon
 *         schema:
 *           type: string
 *         required: true
 *         description: Epsilon value for DBSCAN clustering.
 *       - in: query
 *         name: min_samples
 *         schema:
 *           type: string
 *         required: true
 *         description: The minimum number of samples in a neighborhood for a data point to qualify as a core point in DBSCAN.
 *       - in: query
 *         name: columns
 *         schema:
 *           type: string
 *         required: true
 *         description: Columns to be considered in the dataset.
 *     responses:
 *       200:
 *         description: Generated dataset filename.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generatedDatasetFileName:
 *                   type: string
 *       500:
 *         description: An error occurred on python script.
 */
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

/**
 * @openapi
 * /api/fetchParallelPlot:
 *   get:
 *     tags:
 *       - Clustering Analysis Endpoints
 *     summary: Fetch Parallel Plot
 *     description: This endpoint generates a parallel plot of a dataset.
 *     parameters:
 *       - in: query
 *         name: dataset_name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the dataset.
 *       - in: query
 *         name: columns
 *         schema:
 *           type: string
 *         required: true
 *         description: Columns to be considered in the dataset.
 *     responses:
 *       200:
 *         description: Generated plot name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generatedPlotName:
 *                   type: string
 *       500:
 *         description: An error occurred on python script.
 */
export const fetchParallelPlot: RequestHandler = (req, res) => {
  const dataset_name = req.query.dataset_name as string;
  const columns = req.query.columns as string;

  const generatedPlotName = `temp_${Date.now()}-${Math.random()}.png`;
  const generatedPlotFilePath = path.join(tempFolder, generatedPlotName);

  const args: string[] = [
    path.join(tempFolder, dataset_name),
    generatedPlotFilePath,
    columns,
  ];

  const pythonProcess = spawn("python3", [
    path.join(pythonScriptsFolder, "parallel_plot.py"),
    ...args,
  ]);

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.send({ generatedPlotName });
    } else {
      res.status(500).json({ error: "An error occurred on python script" });
    }
  });
};

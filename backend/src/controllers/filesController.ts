import { RequestHandler } from "express";
import fs, { createReadStream } from "fs";
import path from "path";

const tempFolder = path.join(__dirname, "..", "..", "/datasets/temp");

/**
 * @openapi
 * /api/deleteTempFiles:
 *   delete:
 *     tags:
 *       - Files Manipulation
 *     summary: Delete Temporary Files
 *     description: This endpoint deletes temporary files.
 *     requestBody:
 *       description: JSON object containing array of temporary filenames to be deleted
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tempFileNames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successfully deleted all files.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filesNotDeleted:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: An error occurred during file deletion.
 */
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

/**
 * @openapi
 * /api/fetchPlotImage:
 *   get:
 *     tags:
 *       - Files Manipulation
 *     summary: Fetch Plot Image
 *     description: This endpoint sends a plot image file.
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the image file.
 *     responses:
 *       200:
 *         description: Image file.
 *       500:
 *         description: An error occurred sending file or file does not exist.
 */
export const fetchPlotImage: RequestHandler = (req, res) => {
  const filename = req.query.filename as string;
  const tempImageFilePath = path.join(tempFolder, filename);
  if (fs.existsSync(tempImageFilePath)) {
    res.sendFile(tempImageFilePath, {}, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      }
      //  else {
      //   // Deleting the image file
      //   fs.unlink(tempImageFilePath, (err) => {
      //     if (err) {
      //       console.error("Error deleting file:", err);
      //     }
      //   });
      // }
    });
  } else {
    res.status(500).send("No such file or directory");
  }
};

/**
 * @openapi
 * /api/downloadPlotImage:
 *   get:
 *     tags:
 *       - Files Manipulation
 *     summary: Download Plot Image
 *     description: This endpoint downloads a plot image file.
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the image file.
 *     responses:
 *       200:
 *         description: Image file for download.
 *       500:
 *         description: An error occurred during file download.
 */

export const downloadPlotImage: RequestHandler = (req, res) => {
  const filename = req.query.filename as string;

  const filePath = path.join(tempFolder, filename);

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  const fileStream = createReadStream(filePath);
  fileStream.pipe(res);
};

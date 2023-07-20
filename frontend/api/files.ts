import axios, { AxiosResponse } from "axios";

export const clearTempFiles = async ({
  tempFileNames,
}: {
  tempFileNames: string[];
}) => {
  const data = {
    tempFileNames,
  };
  try {
    const response: AxiosResponse<
      string | { message: string; filesNotDeleted: string[] }
    > = await axios.delete(`http://localhost:8081/api/deleteTempFiles`, {
      headers: {
        "Content-Type": "application/json",
      },
      data,
    });

    return response;
  } catch (error) {
    return null;
  }
};

export const downloadPlotImage = async ({ fileName }: { fileName: string }) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/downloadPlotImage?filename=${fileName}`,
      {
        responseType: "blob", // Set the response type to blob
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading dataset:", error);
  }
};

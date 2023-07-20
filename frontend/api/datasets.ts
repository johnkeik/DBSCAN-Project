import axios, { AxiosResponse } from "axios";
import queryString from "query-string";

export interface DatasetResponse {
  header: string[];
  numericalHeaders: string[];
  content: string[];
  totalPages: number;
  totalChunks: number;
}

export const fetchPublicDatasets = async (): Promise<string[] | null> => {
  try {
    const response: AxiosResponse<string[]> = await axios.get(
      "http://localhost:8081/api/fetchPublicDatasets"
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const fetchPrivateDatasets = async (
  token: string
): Promise<string[] | null> => {
  try {
    const response: AxiosResponse<string[]> = await axios.get(
      "http://localhost:8081/api/fetchPrivateDatasets",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const fetchPublicDataset = async ({
  filename,
  chunkIndex,
  pageSize,
  isTempDataset,
}: {
  filename: string;
  chunkIndex?: number;
  pageSize?: number;
  isTempDataset?: boolean;
}) => {
  try {
    const response: AxiosResponse<DatasetResponse> = await axios.get(
      `http://localhost:8081/api/fetchPublicDataset?filename=${filename}${
        chunkIndex !== undefined ? `&chunkIndex=${chunkIndex}` : ""
      }${pageSize !== undefined ? `&pageSize=${pageSize}` : ""}${
        isTempDataset ? "&isTempDataset=true" : ""
      }&timestamp=${Date.now()}`
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const fetchPrivateDataset = async ({
  filename,
  chunkIndex,
  pageSize,
  token,
}: {
  filename: string;
  chunkIndex?: number;
  pageSize?: number;
  token: string;
}) => {
  try {
    const response: AxiosResponse<DatasetResponse> = await axios.get(
      `http://localhost:8081/api/fetchPrivateDataset?filename=${filename}${
        chunkIndex !== undefined ? `&chunkIndex=${chunkIndex}` : ""
      }${
        pageSize !== undefined ? `&pageSize=${pageSize}` : ""
      }&timestamp=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const deleteDataset = async ({
  token,
  filename,
  fileType,
}: {
  token: string;
  filename: string;
  fileType: string;
}) => {
  try {
    const response: AxiosResponse<DatasetResponse> = await axios.delete(
      `http://localhost:8081/api/deleteDataset?filename=${filename}&fileType=${fileType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const fetchOptimalEpsilon = async ({
  k,
  dataset_name,
  columns,
}: {
  k: number;
  dataset_name: string;
  columns: string[];
}) => {
  const params = queryString.stringify({
    k,
    dataset_name,
    columns: columns.join(","),
  });

  try {
    const response: AxiosResponse<{ epsilon: string; plotImage: string }> =
      await axios.get(`http://localhost:8081/api/findEpsilonAsGuest?${params}`);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const applyDBSCAN = async ({
  dataset_name,
  epsilon,
  min_samples,
  columns,
}: {
  dataset_name: string;
  epsilon: number;
  min_samples: number;
  columns: string[];
}) => {
  const params = queryString.stringify({
    dataset_name,
    epsilon,
    min_samples,
    columns: columns.join(","),
  });

  try {
    const response: AxiosResponse<{ generatedDatasetFileName: string }> =
      await axios.get(`http://localhost:8081/api/applyDBSCAN?${params}`);

    return response.data;
  } catch (error: any) {
    return null;
  }
};

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

export const downloadDataset = async ({
  fileName,
  isTempDataset,
}: {
  fileName: string;
  isTempDataset?: boolean;
}) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/downloadDataset?filename=${fileName}${
        isTempDataset ? "&isTempDataset=true" : ""
      }`,
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

export const uploadDataset = async ({
  file,
  token,
  uploadPublic,
}: {
  file: any;
  token: string;
  uploadPublic: boolean;
}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `http://localhost:8081/api/uploadDataset?isPublic=${uploadPublic}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to upload file");
  }
};

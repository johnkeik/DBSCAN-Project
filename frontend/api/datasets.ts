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

export const fetchDataset = async ({
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
      `http://localhost:8081/api/fetchDataset?filename=${filename}${
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

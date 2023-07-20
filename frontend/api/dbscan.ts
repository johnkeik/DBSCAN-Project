import axios, { AxiosResponse } from "axios";
import queryString from "query-string";

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

export const fetchParallelPlot = async ({
  dataset_name,
  columns,
}: {
  dataset_name: string;
  columns: string[];
}) => {
  const params = queryString.stringify({
    dataset_name,
    columns: columns.join(","),
  });

  try {
    const response: AxiosResponse<{ generatedPlotName: string }> =
      await axios.get(`http://localhost:8081/api/fetchParallelPlot?${params}`);

    return response.data;
  } catch (error: any) {
    return null;
  }
};

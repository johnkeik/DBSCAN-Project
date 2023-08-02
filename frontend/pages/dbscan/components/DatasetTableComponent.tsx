import { Select, Spin } from "antd";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { fetchPrivateDataset, fetchPublicDataset } from "@/api/datasets";
import { DatasetType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

interface DatasetResponse {
  header: string[];
  content: string[];
  totalPages: number;
  totalChunks: number;
}

const DatasetTableCompoent = ({
  dataset,
  setDatasetHeaders,
  setNumericalDatasetHeaders,
  isTempDataset,
}: {
  dataset: DatasetType;
  setDatasetHeaders?: Dispatch<SetStateAction<string[]>>;
  setNumericalDatasetHeaders?: Dispatch<SetStateAction<string[]>>;
  isTempDataset?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DatasetResponse | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<{
    index: number;
    action?: "forward" | "backward";
  }>({
    index: 0,
  });
  const [pageSize, setPageSize] = useState(15);
  const pageSizes = [15, 30, 50, 100];
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (dataset.type === "private") {
        await fetchPrivateDataset({
          filename: dataset.name,
          chunkIndex: currentChunkIndex.index,
          pageSize,
          token: Cookies.get("accessToken") ?? "",
        }).then((response) => {
          if (response) {
            setData(response);
            setDatasetHeaders && setDatasetHeaders(response.header);
            setNumericalDatasetHeaders &&
              setNumericalDatasetHeaders(response.numericalHeaders);
          } else {
            console.log("no data");
          }
        });
      } else {
        await fetchPublicDataset({
          filename: dataset.name,
          chunkIndex: currentChunkIndex.index,
          pageSize,
          isTempDataset: dataset.type === "temp",
        }).then((response) => {
          if (response) {
            setData(response);
            setDatasetHeaders && setDatasetHeaders(response.header);
            setNumericalDatasetHeaders &&
              setNumericalDatasetHeaders(response.numericalHeaders);
          } else {
            console.log("no data");
          }
        });
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChunkIndex, dataset]);

  const chunkSize = 3; // Number of chunks per page
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (data) {
      const startPage = currentChunkIndex.index * chunkSize + 1;
      const endPage = Math.min(startPage + chunkSize - 1, data.totalPages);
      const pageNumbers: number[] = [];

      for (let i = 0; i < endPage - startPage + 1; i++) {
        pageNumbers.push(startPage + i);
      }
      setPageNumbers(pageNumbers);
      if (currentChunkIndex.action === "backward")
        setCurrentPageIndex(pageNumbers.length - 1);
      else setCurrentPageIndex(0);
    }
  }, [currentChunkIndex, data]);

  const startIndex = useMemo(() => {
    return currentPageIndex * pageSize;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex]);

  const endIndex = useMemo(() => {
    return startIndex + pageSize;
  }, [startIndex, pageSize]);

  const paginatedContent = useMemo(() => {
    if (data) return data.content.slice(startIndex, endIndex);
    else return [];
  }, [data, startIndex, endIndex]);

  const handlePreviousChunk = () => {
    if (currentChunkIndex.index > 0 && !loading) {
      setCurrentChunkIndex({
        index: currentChunkIndex.index - 1,
        action: "backward",
      });
    }
  };

  const handleNextChunk = () => {
    if (data && currentChunkIndex.index < data.totalChunks - 1 && !loading) {
      setCurrentChunkIndex({
        index: currentChunkIndex.index + 1,
        action: "forward",
      });
    }
  };

  return data ? (
    <div className="flex flex-col s min-w-[100px] border-2 rounded-lg p-5 shadow-xl bg-white">
      <div className=" overflow-x-auto">
        <table className="table-auto min-w-full">
          <thead>
            <tr>
              {data?.header.map((column, index) => (
                <th key={index} className="px-4 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedContent.map((row, index) => (
              <tr key={index}>
                {row.split(",").map((cell, index) => (
                  <td key={index} className="border px-4 py-2" align="center">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-start gap-5 justify-center mt-4">
        <div className="flex flex-col ">
          <div className="flex flex-row items-center gap-2">
            <h1>Rows per page:</h1>
            <Select
              style={{ width: 120 }}
              value={pageSize}
              onChange={(value) => {
                setCurrentChunkIndex({ index: 0 });
                setPageSize(value);
              }}
              options={pageSizes.map((size) => ({ label: size, value: size }))}
            />
          </div>
          <h1>Total Pages: {data.totalPages}</h1>
        </div>
        <div className="flex flex-row justify-center w-full">
          <button
            className={`px-4 py-2 mr-2 rounded text-black ${
              currentChunkIndex.index !== 0 ? "visible" : "invisible"
            }`}
            onClick={() => handlePreviousChunk()}
          >
            {loading ? (
              <Spin />
            ) : (
              <h1 className=" text-md">
                <ArrowBackIosIcon fontSize="inherit" />
                ...
              </h1>
            )}
          </button>
          {pageNumbers.map((pageNumber, index) => (
            <button
              key={index}
              className={`px-4 py-2 mr-2 rounded ${
                currentPageIndex === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setCurrentPageIndex(index)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            className={`px-4 py-2 mr-2 rounded text-black ${
              currentChunkIndex.index !== data.totalChunks - 1
                ? "visible"
                : "invisible"
            }`}
            onClick={() => handleNextChunk()}
          >
            {loading ? (
              <Spin />
            ) : (
              <h1 className=" text-md">
                ... <ArrowForwardIosIcon fontSize="inherit" />
              </h1>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default DatasetTableCompoent;

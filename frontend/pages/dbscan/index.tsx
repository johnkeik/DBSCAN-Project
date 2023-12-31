import { useEffect, useMemo, useState } from "react";
import DatasetTableCard from "./components/DatasetTableCard";
import CalculateEpsilonCard from "./components/CalculateEpsilonCard";
import DatasetHeadersCard from "./components/DatasetHeadersCard";
import DBSCANCard from "./components/DBSCANCard";
import DatasetsList from "./components/DatasetsList";
import { clearTempFiles } from "@/api/files";
import { useRouter } from "next/router";
import { DatasetType } from "@/types";

const DBSCAN = () => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(
    null
  );
  const [datasetHeaders, setDatasetHeaders] = useState<string[]>([]);
  const [numericalDatasetHeaders, setNumericalDatasetHeaders] = useState<
    string[]
  >([]);
  const [headers, setHeaders] = useState<
    {
      header: string;
      value: boolean;
      disabled: boolean;
    }[]
  >([]);
  const [tempFileNames, setTempFileNames] = useState<string[]>([]);

  useEffect(() => {
    setDatasetHeaders([]);
    setNumericalDatasetHeaders([]);

    (async () => {
      if (tempFileNames.length > 0)
        await clearTempFiles({ tempFileNames }).then(() => {
          setTempFileNames([]);
        });
    })();
  }, [selectedDataset]);

  useEffect(() => {
    const temp = datasetHeaders.map((header) => {
      if (numericalDatasetHeaders.includes(header)) {
        return {
          header: header.replaceAll('"', ""),
          value: true,
          disabled: false,
        };
      } else {
        return {
          header: header.replaceAll('"', ""),
          value: false,
          disabled: true,
        };
      }
    });

    setHeaders(temp);
  }, [datasetHeaders, numericalDatasetHeaders]);

  const numericalColumnNames = useMemo(() => {
    const temp = headers.map((header) => {
      if (header.value) return header.header;
      else return null;
    });
    return temp.filter((value): value is string => value !== null);
  }, [headers]);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = async () => {
      if (tempFileNames.length > 0) {
        await clearTempFiles({ tempFileNames });
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events, tempFileNames]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.onbeforeunload = async function (e) {
        if (tempFileNames.length > 0) await clearTempFiles({ tempFileNames });
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        window.onbeforeunload = null;
      }
    };
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-fixed bg-center bg-cover custom-background-img relative">
      <div className="flex-col items-center justify-center overflow-auto mt-[77px] w-full max-h-[calc(100vh-77px)] pb-[150px] pt-[123px]">
        <div className="flex flex-col items-center">
          <h1 className=" text-6xl pb-10 text-white">DBSCAN Appliance</h1>

          <DatasetsList
            selectedDataset={selectedDataset}
            setSelectedDataset={setSelectedDataset}
          />
        </div>
        {selectedDataset && (
          <div className="flex flex-col items-center">
            <DatasetTableCard
              dataset={selectedDataset}
              setDatasetHeaders={setDatasetHeaders}
              setNumericalDatasetHeaders={setNumericalDatasetHeaders}
            />
            {datasetHeaders && (
              <DatasetHeadersCard headers={headers} setHeaders={setHeaders} />
            )}
            <CalculateEpsilonCard
              dataset_name={selectedDataset.name}
              columns={numericalColumnNames}
              setTempFileNames={setTempFileNames}
            />
            <DBSCANCard
              dataset={selectedDataset}
              columns={numericalColumnNames}
              setTempFileNames={setTempFileNames}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DBSCAN;

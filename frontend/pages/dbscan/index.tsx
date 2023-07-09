import { useEffect, useMemo, useState } from "react";
import DatasetTableCard from "./components/DatasetTableCard";
import CalculateEpsilonCard from "./components/CalculateEpsilonCard";
import DatasetHeadersCard from "./components/DatasetHeadersCard";
import DBSCANCard from "./components/DBSCANCard";
import DatasetsList from "./components/DatasetsList";

const DBSCAN = () => {
  const [selectedDataset, setSelectedDataset] = useState<{
    name: string;
    public: boolean;
  } | null>(null);
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

  useEffect(() => {
    setDatasetHeaders([]);
    setNumericalDatasetHeaders([]);
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

  return (
    <div className="flex flex-col items-center justify-center pb-[150px]">
      <h1 className=" text-6xl pb-10">DBSCAN Appliance</h1>
      <DatasetsList
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
      />
      {selectedDataset && (
        <div className="flex flex-col items-center">
          <DatasetTableCard
            filename={selectedDataset.name}
            setDatasetHeaders={setDatasetHeaders}
            setNumericalDatasetHeaders={setNumericalDatasetHeaders}
          />
          {datasetHeaders && (
            <DatasetHeadersCard headers={headers} setHeaders={setHeaders} />
          )}
          <CalculateEpsilonCard
            dataset_name={selectedDataset.name}
            columns={numericalColumnNames}
          />
          <DBSCANCard
            dataset_name={selectedDataset.name}
            columns={numericalColumnNames}
          />
        </div>
      )}
    </div>
  );
};

export default DBSCAN;

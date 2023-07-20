import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import DatasetTableCompoent from "./DatasetTableComponent";
import { DatasetType } from "@/types";

const DatasetTableCard = ({
  dataset,
  setDatasetHeaders,
  setNumericalDatasetHeaders,
}: {
  dataset: DatasetType;
  setDatasetHeaders: Dispatch<SetStateAction<string[]>>;
  setNumericalDatasetHeaders: Dispatch<SetStateAction<string[]>>;
}) => {
  return (
    <div className="w-[900px] min-w-[100px] mt-10">
      <DatasetTableCompoent
        dataset={dataset}
        setDatasetHeaders={setDatasetHeaders}
        setNumericalDatasetHeaders={setNumericalDatasetHeaders}
      />
    </div>
  );
};

export default DatasetTableCard;

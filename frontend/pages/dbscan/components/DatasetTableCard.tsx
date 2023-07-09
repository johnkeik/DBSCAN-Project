import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import DatasetTableCompoent from "./DatasetTableComponent";

const DatasetTableCard = ({
  filename,
  setDatasetHeaders,
  setNumericalDatasetHeaders,
}: {
  filename: string;
  setDatasetHeaders: Dispatch<SetStateAction<string[]>>;
  setNumericalDatasetHeaders: Dispatch<SetStateAction<string[]>>;
}) => {
  return (
    <div className="w-[900px] min-w-[100px] mt-10">
      <DatasetTableCompoent
        filename={filename}
        setDatasetHeaders={setDatasetHeaders}
        setNumericalDatasetHeaders={setNumericalDatasetHeaders}
      />
    </div>
  );
};

export default DatasetTableCard;

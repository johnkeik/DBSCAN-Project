import { Checkbox } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const DatasetHeadersCard = ({
  headers,
  setHeaders,
}: {
  headers: { header: string; value: boolean; disabled: boolean }[];
  setHeaders: Dispatch<
    SetStateAction<
      {
        header: string;
        value: boolean;
        disabled: boolean;
      }[]
    >
  >;
}) => {
  const updateItem = (index: number, value: boolean) => {
    // Make a copy of the state array
    const updatedItems = [...headers];

    // Make changes to the object
    updatedItems[index] = {
      ...updatedItems[index],
      value: value,
    };

    // Update the state array
    setHeaders(updatedItems);
  };

  return (
    <div className="w-[600px] flex flex-col gap-3 min-w-[100px] border-2 rounded-lg p-5 shadow-xl mt-10 bg-white">
      <h1>
        Headers that will be included for the optimal epsilon calculations:
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {headers.map((header, index) => {
          return (
            <div key={header.header} className="flex items-center  gap-2">
              <Checkbox
                defaultChecked={header.value}
                disabled={header.disabled}
                onChange={(e) => {
                  updateItem(index, e.target.checked);
                }}
              />
              <label
                className={`${
                  header.disabled ? "text-slate-700" : "text-black"
                }`}
              >
                {header.header}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatasetHeadersCard;

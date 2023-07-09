import { fetchPublicDatasets } from "@/api/datasets";
import { useAuth } from "@/context/AuthContext";
import { Select, Spin } from "antd";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

const DatasetsList = ({
  selectedDataset,
  setSelectedDataset,
}: {
  selectedDataset: {
    name: string;
    public: boolean;
  } | null;
  setSelectedDataset: Dispatch<
    SetStateAction<{
      name: string;
      public: boolean;
    } | null>
  >;
}) => {
  const [publicDatasets, setPublicDatasets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const datasets = await fetchPublicDatasets();
      setPublicDatasets(datasets);
      setLoading(false);
    })();
  }, []);

  const datasetsList = useMemo(() => {
    if (publicDatasets) {
      return publicDatasets.map((dataset) => {
        return { value: `${dataset}(public)`, label: `${dataset} (public)` };
      });
    } else {
      return undefined;
    }
  }, [publicDatasets]);

  return (
    <div className="w-[600px] flex flex-col min-w-[100px] border-2 rounded-lg p-5 shadow-xl">
      {loading ? (
        <Spin />
      ) : (
        <>
          <h1 className="pb-2">Select a dataset:</h1>
          <Select
            size="large"
            showSearch
            placeholder="Select a person"
            optionFilterProp="children"
            onChange={(value: string) => {
              setSelectedDataset({
                name: value.replace("(public)", ""),
                public: value.includes("(public)"),
              });
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={datasetsList}
            className="min-w-full"
          />
          <div className="flex flex-row w-full justify-end pt-5 gap-3">
            {user && selectedDataset && !selectedDataset.public && (
              <button className=" rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-800">
                Upload
              </button>
            )}
            <button className=" rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-800">
              Download
            </button>
            {user && selectedDataset && !selectedDataset.public && (
              <button className=" rounded-lg bg-red-400 p-2 text-white hover:bg-red-600">
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DatasetsList;

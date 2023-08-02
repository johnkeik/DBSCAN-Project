import {
  deleteDataset,
  downloadDataset,
  fetchPrivateDatasets,
  fetchPublicDatasets,
} from "@/api/datasets";
import { useAuth } from "@/context/AuthContext";
import { Select, Spin, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import UploadFormModal from "./UploadFormModal";
import Cookies from "js-cookie";
import { DatasetType } from "@/types";

const DatasetsList = ({
  selectedDataset,
  setSelectedDataset,
}: {
  selectedDataset: DatasetType | null;
  setSelectedDataset: Dispatch<SetStateAction<DatasetType | null>>;
}) => {
  const [publicDatasets, setPublicDatasets] = useState<string[] | null>(null);
  const [privateDatasets, setPrivateDatasets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchDatasets = async () => {
    setLoading(true);
    await fetchPublicDatasets().then((datasets) => {
      setPublicDatasets(datasets);
    });
    if (user)
      await fetchPrivateDatasets(Cookies.get("accessToken") ?? "").then(
        (datasets) => {
          setPrivateDatasets(datasets);
        }
      );
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchDatasets();
    })();
  }, []);

  const datasetsList = useMemo(() => {
    const tempList: {
      value: string;
      label: string;
    }[] = [];

    if (publicDatasets) {
      publicDatasets.forEach((dataset) => {
        tempList.push({
          value: `${dataset}(public)`,
          label: `${dataset} (public)`,
        });
      });
    }
    if (privateDatasets) {
      privateDatasets.forEach((dataset) => {
        tempList.push({ value: `${dataset}`, label: `${dataset}` });
      });
    }

    return tempList;
  }, [publicDatasets, privateDatasets]);

  return (
    <div className="w-[600px] flex flex-col min-w-[100px] border-2 rounded-lg p-5 shadow-xl bg-white">
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
                type: value.includes("(public)") ? "public" : "private",
              });
            }}
            value={selectedDataset?.name}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={datasetsList}
            className="min-w-full"
          />
          <div className="flex flex-row w-full justify-end pt-5 gap-3">
            {user && (
              <button
                className=" rounded-lg bg-green-500 p-2 text-white hover:bg-green-800"
                onClick={() => {
                  setShowUploadModal(true);
                }}
              >
                Upload
              </button>
            )}
            {selectedDataset && (
              <button
                className=" rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-800"
                onClick={async () => {
                  await downloadDataset({ fileName: selectedDataset?.name });
                }}
              >
                Download
              </button>
            )}
            {user &&
              selectedDataset &&
              (selectedDataset.type === "private" ||
                (selectedDataset.type === "public" &&
                  user.publicAccess === 1)) && (
                <button
                  className=" rounded-lg bg-red-400 p-2 text-white hover:bg-red-600"
                  onClick={async () => {
                    await deleteDataset({
                      token: Cookies.get("accessToken") ?? "",
                      filename: selectedDataset.name,
                      fileType: selectedDataset.type,
                    })
                      .then(async () => {
                        setSelectedDataset(null);
                        await fetchDatasets();
                        message.success("Successfully deleted file!");
                      })
                      .catch(() => {
                        message.error(
                          "Something went wrong. Please try again later!"
                        );
                      });
                  }}
                >
                  Delete
                </button>
              )}
          </div>
        </>
      )}
      <UploadFormModal
        visible={showUploadModal}
        onCancel={() => {
          setShowUploadModal(false);
        }}
        fetchDatasets={async () => {
          await fetchDatasets();
        }}
      />
    </div>
  );
};

export default DatasetsList;

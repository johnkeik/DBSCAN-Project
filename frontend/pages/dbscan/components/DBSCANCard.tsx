import { downloadDataset } from "@/api/datasets";
import { Button, Form, FormInstance, Input, Modal, Spin, Image } from "antd";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import DatasetTableCompoent from "./DatasetTableComponent";
import { DatasetType } from "@/types";
import { applyDBSCAN, fetchParallelPlot } from "@/api/dbscan";
import { downloadPlotImage } from "@/api/files";

const INT_REGEX = /^(?:1000|[1-9]\d{0,2})$/;

const DBSCANCard = ({
  dataset,
  columns,
  setTempFileNames,
}: {
  dataset: DatasetType;
  columns: string[];
  setTempFileNames: Dispatch<SetStateAction<string[]>>;
}) => {
  const formRef = useRef<FormInstance>(null);
  const [loading, setLoading] = useState(false);
  const [generateDatasetName, setGeneratedDatasetName] = useState("");
  const [epsilon, setEpsilon] = useState<number>();
  const [minSamples, setMinSamples] = useState<number>();
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [generatedPlotImage, setGeneratedPlotImage] = useState("");
  const [plotLoading, setPlotLoading] = useState(false);

  useEffect(() => {
    setGeneratedDatasetName("");
    setGeneratedPlotImage("");
  }, [dataset]);

  const handleSubmit = async (values: {
    epsilon: number;
    min_samples: number;
  }) => {
    setGeneratedPlotImage("");
    setLoading(true);
    const response = await applyDBSCAN({
      dataset_name: dataset.name,
      epsilon: values.epsilon,
      min_samples: values.min_samples,
      columns,
    });
    setLoading(false);
    if (response) {
      setEpsilon(values.epsilon);
      setMinSamples(values.min_samples);
      setGeneratedDatasetName(response.generatedDatasetFileName);
      setTempFileNames((prevArray) => [
        ...prevArray,
        response.generatedDatasetFileName,
      ]);
      formRef.current?.resetFields();
    } else {
      console.log("something went wrong");
    }
  };

  useEffect(() => {
    (async () => {
      if (showPlotModal && generatedPlotImage === "") {
        setPlotLoading(true);
        await fetchParallelPlot({
          dataset_name: generateDatasetName,
          columns,
        }).then((response) => {
          if (response) {
            setGeneratedPlotImage(response.generatedPlotName);
            setTempFileNames((prevArray) => [
              ...prevArray,
              response.generatedPlotName,
            ]);
          }
        });
        setPlotLoading(false);
      }
    })();
  }, [showPlotModal]);

  return (
    <div className="max-w-[900px] flex flex-col min-w-[100px] border-2 rounded-lg p-5 shadow-xl mt-10 bg-white">
      <h1 className="pb-2">DBSCAN</h1>

      <Form
        onFinish={handleSubmit}
        ref={formRef}
        className="flex flex-row gap-3 pb-2"
      >
        <Form.Item
          name="epsilon"
          rules={[
            {
              required: true,
              message: "Please enter your epsilon value!",
            },
            // {
            //   pattern: K_REGEX,
            //   message: "K must be an integer",
            // },
          ]}
        >
          <Input size="large" placeholder="Enter epsilon" />
        </Form.Item>
        <Form.Item
          name="min_samples"
          rules={[
            {
              required: true,
              message: "Please enter min samples!",
            },
            {
              pattern: INT_REGEX,
              message: "Min samples must be an integer",
            },
          ]}
        >
          <Input size="large" placeholder="Enter min samples" />
        </Form.Item>
        <Button
          style={{
            backgroundColor: "blue",
            color: "white",
          }}
          size="large"
          htmlType="submit"
        >
          Get Chart
        </Button>
      </Form>

      {loading ? (
        <Spin />
      ) : (
        <>
          {generateDatasetName && (
            <>
              <div className="flex flex-row justify-between items-end py-2">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 ">
                    <h1>Epsilon: {epsilon}</h1>
                    <h1>Min Samples: {minSamples}</h1>
                  </div>
                  <h1>Generated dataset preview:</h1>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    className=" rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-800"
                    onClick={async () => {
                      await downloadDataset({
                        fileName: generateDatasetName,
                        isTempDataset: true,
                      });
                    }}
                  >
                    Download
                  </button>
                  <button
                    className=" rounded-lg bg-green-700 p-2 text-white hover:bg-green-900"
                    onClick={() => {
                      setShowPlotModal(true);
                    }}
                  >
                    Generate Plot
                  </button>
                </div>
              </div>

              <DatasetTableCompoent
                dataset={{ name: generateDatasetName, type: "temp" }}
                isTempDataset={true}
              />
            </>
          )}
        </>
      )}
      <Modal
        open={showPlotModal}
        title="Parallel Plot"
        onCancel={() => {
          setShowPlotModal(false);
        }}
        width={800}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setShowPlotModal(false);
            }}
          >
            Close
          </Button>,
          <Button
            key="download"
            onClick={async () => {
              await downloadPlotImage({ fileName: generatedPlotImage });
            }}
          >
            Download
          </Button>,
        ]}
      >
        {plotLoading ? (
          <div className="flex flex-row gap-5">
            <h1>Generating plot image</h1>
            <Spin />
          </div>
        ) : (
          <>
            {generatedPlotImage && (
              <Image
                src={`http://localhost:8081/api/fetchPlotImage?filename=${generatedPlotImage}`}
                alt="img"
                width={700}
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default DBSCANCard;

import { applyDBSCAN } from "@/api/datasets";
import { Button, Form, FormInstance, Input } from "antd";
import { useRef, useState } from "react";
import DatasetTableCompoent from "./DatasetTableComponent";

const INT_REGEX = /^(?:1000|[1-9]\d{0,2})$/;

const DBSCANCard = ({
  dataset_name,
  columns,
}: {
  dataset_name: string;
  columns: string[];
}) => {
  const formRef = useRef<FormInstance>(null);
  const [loading, setLoading] = useState(false);
  const [generateDatasetName, setGeneratedDatasetName] = useState("");
  const [datasetHeaders, setDatasetHeaders] = useState<string[]>([]);

  const handleSubmit = async (values: {
    epsilon: number;
    min_samples: number;
  }) => {
    setLoading(true);
    const response = await applyDBSCAN({
      dataset_name,
      epsilon: values.epsilon,
      min_samples: values.min_samples,
      columns,
    });
    setLoading(false);
    if (response) {
      setGeneratedDatasetName(response.generatedDatasetFileName);
    } else {
      console.log("something went wrong");
    }
  };
  return (
    <div className="w-[900px] flex flex-col min-w-[100px] border-2 rounded-lg p-5 shadow-xl mt-10">
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

      {generateDatasetName && (
        <>
          <div className="flex flex-row justify-between items-end py-2">
            <h1>Generated dataset preview:</h1>
            <div className="flex flex-row gap-2">
              <button className=" rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-800">
                Download
              </button>
              <button className=" rounded-lg bg-green-700 p-2 text-white hover:bg-green-900">
                Generate Plot
              </button>
            </div>
          </div>
          <DatasetTableCompoent
            filename={generateDatasetName}
            setDatasetHeaders={setDatasetHeaders}
            isTempDataset={true}
          />
        </>
      )}
    </div>
  );
};

export default DBSCANCard;

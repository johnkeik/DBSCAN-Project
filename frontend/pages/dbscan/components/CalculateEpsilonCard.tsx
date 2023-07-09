import { fetchOptimalEpsilon } from "@/api/datasets";
import { Button, Form, FormInstance, Input, Spin } from "antd";
import Image from "next/image";
import { useRef, useState } from "react";

const K_REGEX = /^(?:1000|[1-9]\d{0,2})$/;

const CalculateEpsilonCard = ({
  dataset_name,
  columns,
}: {
  dataset_name: string;
  columns: string[];
}) => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormInstance>(null);
  const [epsilon, setEpsilon] = useState("");
  const [plotImage, setPlotImage] = useState("");

  const calculateEpsilon = async (values: { k: number }) => {
    setLoading(true);
    const response = await fetchOptimalEpsilon({
      k: values.k,
      dataset_name: dataset_name,
      columns,
    });
    setLoading(false);
    if (response) {
      setEpsilon(response.epsilon);
      setPlotImage(response.plotImage);
    } else {
      console.log("something went wrong");
    }
  };
  return (
    <div className="w-[600px] flex flex-col min-w-[100px] border-2 rounded-lg p-5 shadow-xl mt-10">
      <h1 className="pb-2">Find optimal epsilon value based on K neighbors:</h1>

      <Form
        onFinish={calculateEpsilon}
        ref={formRef}
        className="flex flex-row gap-3"
      >
        <Form.Item
          name="k"
          rules={[
            {
              required: true,
              message: "Please enter your K value!",
            },
            {
              pattern: K_REGEX,
              message: "K must be an integer",
            },
          ]}
        >
          <Input size="large" placeholder="Enter K neighbors" />
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
        <div className="flex flex-col w-full ">
          {plotImage && (
            <div className=" relative w-full aspect-[16/12]">
              <Image
                src={`http://localhost:8081/api/fetchPlotImage?filename=${plotImage}`}
                alt="img"
                fill
              />
            </div>
          )}
          {epsilon && <h1>Suggested epsilon {epsilon}</h1>}
        </div>
      )}
    </div>
  );
};

export default CalculateEpsilonCard;

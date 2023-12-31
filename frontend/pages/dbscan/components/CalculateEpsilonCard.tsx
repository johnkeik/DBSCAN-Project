import { fetchOptimalEpsilon } from "@/api/dbscan";
import { Button, Form, FormInstance, Input, Spin, Image } from "antd";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const K_REGEX = /^(?:1000|[1-9]\d{0,2})$/;

const CalculateEpsilonCard = ({
  dataset_name,
  columns,
  setTempFileNames,
}: {
  dataset_name: string;
  columns: string[];
  setTempFileNames: Dispatch<SetStateAction<string[]>>;
}) => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormInstance>(null);
  const [responses, setResponses] = useState<
    { epsilon: string; plotImage: string }[]
  >([]);

  useEffect(() => {
    setResponses([]);
  }, [dataset_name]);

  const calculateEpsilon = async (values: { k: number }) => {
    setResponses([]);
    setLoading(true);

    for (let i = 0; i < 6; i++) {
      await fetchOptimalEpsilon({
        k: values.k++,
        dataset_name: dataset_name,
        columns,
      })
        .then((response) => {
          if (response) {
            setResponses((prevArray) => [...prevArray, response]);
            setTempFileNames((prevArray) => [...prevArray, response.plotImage]);
          }
        })
        .catch(() => {
          console.log("something went wrong");
        });
    }
    setLoading(false);
  };

  return (
    <div className=" flex flex-col min-w-[100px] border-2 rounded-lg p-5 shadow-xl mt-10 bg-white">
      <div className="flex flex-col justify-center">
        <h1 className="pb-2">
          Find optimal epsilon value based on K neighbors:
        </h1>

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
      </div>

      {loading ? (
        <Spin />
      ) : (
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-5">
          {responses.map((response) => {
            return (
              <div
                className="flex flex-col w-[450px] items-center pb-5 mb-3"
                key={response.plotImage}
              >
                {response.plotImage && (
                  <Image
                    src={`http://localhost:8081/api/fetchPlotImage?filename=${response.plotImage}`}
                    alt="img"
                    width={450}
                  />
                )}
                {response.epsilon && (
                  <h1>Suggested epsilon {response.epsilon}</h1>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalculateEpsilonCard;

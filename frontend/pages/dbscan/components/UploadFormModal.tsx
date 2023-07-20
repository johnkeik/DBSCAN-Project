import { useState } from "react";
import { Modal, Button, Upload, message, Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { uploadDataset } from "@/api/datasets";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

const UploadFormModal = ({
  visible,
  onCancel,
  fetchDatasets,
}: {
  visible: boolean;
  onCancel: () => void;
  fetchDatasets: () => void;
}): JSX.Element => {
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [uploadPublic, setUploadPublic] = useState(false);
  const { user } = useAuth();
  const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    let fileList = [...info.fileList];

    // Limit the number of files to 1
    fileList = fileList.slice(-1);

    // Remove files that are not CSV
    fileList = fileList.filter((file) => {
      const isCSV = file.type === "text/csv";
      if (!isCSV) {
        message.error("Please upload a CSV file!");
      }
      return isCSV;
    });

    setFileList(fileList);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error("Please select a file to upload");
      return;
    }

    const file = fileList[0].originFileObj;

    try {
      await uploadDataset({
        file,
        token: Cookies.get("accessToken") ?? "",
        uploadPublic: uploadPublic,
      });
      await fetchDatasets();
      message.success("File uploaded successfully");
      setFileList([]);
      onCancel();
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Failed to upload file");
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={() => {
        setFileList([]);
        onCancel();
      }}
      title="Upload Dataset"
      footer={[
        <button
          key="cancel"
          onClick={() => {
            setFileList([]);
            onCancel();
          }}
          className=" rounded-lg bg-red-500 p-2 text-white hover:bg-red-800 mr-3"
        >
          Cancel
        </button>,
        <button
          key="upload"
          className=" rounded-lg bg-green-500 p-2 text-white hover:bg-green-800"
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          Upload
        </button>,
      ]}
    >
      <div className="flex flex-col gap-3 pt-5">
        {user && user.publicAccess !== 0 && (
          <Checkbox
            checked={uploadPublic}
            onChange={(e) => {
              setUploadPublic(e.target.checked);
            }}
          >
            Is it a public dataset?
          </Checkbox>
        )}
        <Upload
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false} // Disable automatic file upload
        >
          <Button icon={<UploadOutlined />} block>
            Select File
          </Button>
        </Upload>
      </div>
    </Modal>
  );
};

export default UploadFormModal;

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  apiKey: string;
  publicAccess: number;
}

export interface DatasetType {
  name: string;
  type: "public" | "temp" | "private";
}

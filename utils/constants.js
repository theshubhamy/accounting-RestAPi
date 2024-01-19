import dotenv from "dotenv";

dotenv.config();

export const username =
  process.env.NODE_ENV === "DEV"
    ? process.env.DB_USERNAME
    : process.env.DB_USERNAME;
export const password =
  process.env.NODE_ENV === "DEV"
    ? process.env.DB_PASSWORD
    : process.env.DB_PASSWORD;
export const host =
  process.env.NODE_ENV === "DEV" ? process.env.DB_HOST : process.env.DB_HOST;
export const port =
  process.env.NODE_ENV === "DEV" ? process.env.DB_PORT : process.env.DB_PORT;
export const database =
  process.env.NODE_ENV === "DEV"
    ? process.env.DB_DATABASENAME
    : process.env.DB_DATABASENAME;
export const path =
  process.env.NODE_ENV === "DEV"
    ? "./utils/ca-certificate.crt"
    : "/home/BeedApi/utils/ca-certificate.crt";
export const env = process.env.NODE_ENV;

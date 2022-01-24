const fs = require("fs");
const _ = require("lodash");
const exec = require("child_process").exec;
const path = require("path");
require("dotenv").config();
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

// Concatenate root directory path with our backup folder.
const backupDirPath = path.join(__dirname, "database-backup");

const storeFileOnAzure = async (file) => {
  const account = process.env.ACCOUNT_NAME || "";
  const accountKey = process.env.ACCOUNT_KEY || "";
  const containerName = "files";

  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
  );

  // List containers
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
  );

  const container = blobServiceClient.getContainerClient(containerName);
  const blobName = "sample.bson";

  const blockBlobClient = container.getBlockBlobClient(blobName);

  const uploadBlobResponse = await blockBlobClient.uploadFile(file);
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
};

// let cmd = `mongodump --uri=${process.env.MONGODB_URI} --out=${backupDirPath}`;
let cmd = `mongodump --out=${backupDirPath} --uri ${process.env.MONGODB_URI}`;

// Auto backup function
const dbAutoBackUp = () => {
  // let myPath = path.join(__dirname, "dump/companiesdb/companies.bson");
  // let myPath = path.join(__dirname, "sample");
  let filePath = backupDirPath + "/companiesdb/companies.bson";
  // let cmd = `mongodump --uri=${process.env.MONGODB_URI} --out=${myPath}`;

  exec(cmd, (error, stdout, stderr) => {
    console.log([cmd, error, backupDirPath]);
    storeFileOnAzure(filePath);
  });
};

dbAutoBackUp();

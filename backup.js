const fs = require("fs");
const _ = require("lodash");
require("dotenv").config();
const exec = require("child_process").exec;
const path = require("path");
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

// Auto backup function
const dbAutoBackUp = () => {
  let myPath = path.join(__dirname, "dump/companiesdb/companies.bson");
  let cmd = `mongodump --uri=${process.env.MONGODB_URI}`;

  exec(cmd, (error, stdout, stderr) => {
    console.log([cmd, error, myPath]);
    storeFileOnAzure(myPath);
  });
};

dbAutoBackUp();

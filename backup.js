const fs = require("fs");
const { MongoTools, MTCommand } = require("node-mongotools");
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
  const account = process.env.ACCOUNT_NAME || "dbblobs";
  const accountKey =
    process.env.ACCOUNT_KEY ||
    "dKAc9Kh3EB4l5pBnI1WFX9Vk3cAgXeu4giSEJs2qAH5Ih6pIlsMDgAmekWh4VpXrAfWMQoiHXKYslhnLkshnEg==";
  const containerName = "files";

  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
  );

  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
  );

  const container = blobServiceClient.getContainerClient(containerName);
  const blobName = "backup.bson";

  const blockBlobClient = container.getBlockBlobClient(blobName);

  const uploadBlobResponse = await blockBlobClient.uploadFile(file);
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
};

// let cmd = `mongodump --out=${backupDirPath} --uri ${process.env.MONGODB_URI}`;

// Auto backup function
// const dbAutoBackUp = () => {
//   let filePath = backupDirPath + "/companiesdb/companies.bson";

//   exec(cmd, (error, stdout, stderr) => {
//     console.log([cmd, error, backupDirPath]);
//     storeFileOnAzure(filePath);
//   });
// };

async function dumpAndRotate(uri, path) {
  var mt = new MongoTools();
  var mtc = new MTCommand(); // to reuse log methods
  // mongodump
  const dumpResult = await mt
    .mongodump({ uri, path })
    .catch(mtc.logError.bind(mtc));
  if (dumpResult === undefined) {
    // error case
    process.exit(1);
  }
  // mtc.logSuccess(dumpResult);
  console.log(dumpResult);
  storeFileOnAzure(dumpResult.fullFileName);
}

// dumpAndRotate(process.env.MONGODB_URI, backupDirPath);
dumpAndRotate(
  "mongodb+srv://yemiwebby:dinner2158@circleci-db.xgrii.mongodb.net/companiesdb?retryWrites=true&w=majority",
  backupDirPath
);

// dbAutoBackUp();

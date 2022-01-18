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
  const blobName = "sample.json";

  const blockBlobClient = container.getBlockBlobClient(blobName);

  const uploadBlobResponse = await blockBlobClient.upload(file, file.length);
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
};

const dbOptions = {
  user: "root",
  pass: "root",
  host: "localhost",
  port: 27017,
  database: "companiesdb",
  autoBackup: true,
  removeOldBackup: true,
  keepLastDaysBackup: 2,
  autoBackupPath: backupDirPath,
};

// return stringDate as a date object.
exports.stringToDate = (dateString) => {
  return new Date(dateString);
};

// Check if variable is empty or not.
exports.empty = (mixedVar) => {
  let undef, key, i, len;
  const emptyValues = [undef, null, false, 0, "", "0"];
  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true;
    }
  }
  if (typeof mixedVar === "object") {
    for (key in mixedVar) {
      return false;
    }
    return true;
  }
  return false;
};

// Auto backup function
const dbAutoBackUp = () => {
  console.log(backupDirPath, "Right here");
  // check for auto backup is enabled or disabled
  if (dbOptions.autoBackup == true) {
    let date = new Date();
    let beforeDate, oldBackupDir, oldBackupPath;

    // Current date
    currentDate = this.stringToDate(date);
    let newBackupDir =
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getDate();

    // New backup path for current backup process
    let newBackupPath = dbOptions.autoBackupPath + "-mongodump-" + newBackupDir;
    // check for remove old backup after keeping # of days given in configuration
    if (dbOptions.removeOldBackup == true) {
      beforeDate = _.clone(currentDate);
      // Substract number of days to keep backup and remove old backup
      beforeDate.setDate(beforeDate.getDate() - dbOptions.keepLastDaysBackup);
      oldBackupDir =
        beforeDate.getFullYear() +
        "-" +
        (beforeDate.getMonth() + 1) +
        "-" +
        beforeDate.getDate();
      // old backup(after keeping # of days)
      oldBackupPath = dbOptions.autoBackupPath + "mongodump-" + oldBackupDir;
    }

    // Command for mongodb dump process
    let cmd =
      "mongodump --host " +
      dbOptions.host +
      " --port " +
      dbOptions.port +
      " --db " +
      dbOptions.database +
      // " --username " +
      // dbOptions.user +
      // " --password " +
      // dbOptions.pass +
      " --out " +
      newBackupPath;

    exec(cmd, (error, stdout, stderr) => {
      if (this.empty(error)) {
        // check for remove old backup after keeping # of days given in configuration.

        // DONT DELETE THE OLD FILES. CREATE MORE WITHIN THE FOLDER AND TAG WITH WITH THE CURRENT DATE AND TIME.
        if (dbOptions.removeOldBackup == true) {
          if (fs.existsSync(oldBackupPath)) {
            exec("rm -rf " + oldBackupPath, (err) => {});
          }
        }
      }

      console.log([cmd, error]);
      storeFileOnAzure(newBackupPath);
    });
  }
};

dbAutoBackUp();

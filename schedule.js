const axios = require("axios").default;
require("dotenv").config();

const API_BASE_URL = "https://circleci.com/api/v2/project";
const vcs = process.env.VCS_TYPE;
const org = process.env.ORG_NAME;
const project = process.env.PROJECT_ID;
const token = process.env.CIRCLECI_TOKEN;

const postScheduleEndpoint = `${API_BASE_URL}/${vcs}/${org}/${project}/schedule`;

async function scheduleDatabaseBackup() {
  try {
    let res = await axios.post(
      postScheduleEndpoint,
      {
        name: "Database backup",
        description: "Schedule database backup for your app in production",
        "attribution-actor": "current",
        parameters: {
          branch: "main",
          "run-schedule": true,
        },
        timetable: {
          "per-hour": 30,
          "hours-of-day": [20, 21, 22],
          "days-of-week": ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        },
      },
      {
        headers: { "circle-token": token },
      }
    );

    console.log(res.data);
  } catch (error) {
    console.log(error.response);
  }
}

scheduleDatabaseBackup();

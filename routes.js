const express = require("express");
const companyModel = require("./models");
const app = express();

app.post("/new-company", async (request, response) => {
  const company = new companyModel(request.body);

  try {
    await company.save();
    response.send(company);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/companies", async (request, response) => {
  const companies = await companyModel.find({});

  try {
    response.send(companies);
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = app;

const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  founder: {
    type: String,
    default: 0,
  },
});

const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;

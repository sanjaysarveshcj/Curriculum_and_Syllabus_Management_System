// models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  assignedFaculty: { type: String, ref: "User", default: "" }, 
  assignedExpert: { type: String, ref: "User", default: "" }, 
  createdBy: {type: String, required: true},
  syllabusUrl: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
  status: { type: String, default: "Draft" },
  feedback: { type: String, default: "" },
  lastUpdated: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);
 
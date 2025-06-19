// models/Regulation.ts
const mongoose = require("mongoose");

const regulationSchema = new mongoose.Schema({
  regulationCode: { type: String, required: true }, // R22, R23 etc.
  department: { type: String, required: true },
  hod: { type: String, ref: "User", required: true },
  curriculumUrl: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
  status: { type: String, default: "Pending" },
  lastUpdated: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Regulation", regulationSchema);

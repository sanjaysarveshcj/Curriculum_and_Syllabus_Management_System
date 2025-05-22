import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/convert-docx", upload.single("docx"), (req, res) => {
  const filePath = req.file.path;
  const outputDir = path.join(__dirname, "converted");
  const pdfFilename = req.file.filename + ".pdf";
  const outputPdfPath = path.join(outputDir, pdfFilename);

  fs.mkdirSync(outputDir, { recursive: true });

  const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${filePath}"`;

  exec(command, (error) => {
    if (error) {
      console.error("LibreOffice conversion error:", error);
      return res.status(500).send("Conversion failed");
    }

    res.download(outputPdfPath, "Generated_Syllabus.pdf", (err) => {
      // Cleanup files
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPdfPath);
    });
  });
});

app.listen(5000, () => {
  console.log("🚀 Server started on http://localhost:5000");
});

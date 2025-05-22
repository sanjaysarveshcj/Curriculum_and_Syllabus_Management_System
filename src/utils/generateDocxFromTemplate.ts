// import PizZip from "pizzip";
// import Docxtemplater from "docxtemplater";
// import { saveAs } from "file-saver";

// export async function generateDocxFromTemplate(templateUrl: string, data: any) {
//   const response = await fetch(templateUrl);
//   const content = await response.arrayBuffer();

//   const zip = new PizZip(content);
//   const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

//   doc.setData(data);

//   try {
//     doc.render();
//   } catch (error) {
//     console.error("Doc rendering failed:", error);
//     throw error;
//   }

//   const output = doc.getZip().generate({ type: "blob" });
//   saveAs(output, "Generated_Syllabus.docx");

// }

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

// 1. Generate .docx from template and data
export async function generateDocxFromTemplate(templateUrl: string, data: any) {
  const response = await fetch(templateUrl);
  const content = await response.arrayBuffer();

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.setData(data);

  try {
    doc.render();
  } catch (error) {
    console.error("Doc rendering failed:", error);
    throw error;
  }

  const output = doc.getZip().generate({ type: "blob" });

  const file = new File([output], "Generated_Syllabus.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  await sendDocxToBackend(file);
}

// 2. Send .docx to backend for conversion
async function sendDocxToBackend(file: File) {
  const formData = new FormData();
  formData.append("docx", file);

  const response = await fetch("http://localhost:5000/convert-docx", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Conversion failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Generated_Syllabus.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

const { Document, Packer } = require("docx");
const docxParser = require("docx-parser"); // optional lib if needed

class DocxMerger {
  constructor() {
    this.sections = [];
  }

  async merge(buffers) {
    for (const buffer of buffers) {
      const doc = await Document.load(buffer); // ⚠️ This might not work with docx 7.x+
      this.sections.push(...doc.sections);
    }
  }

  async save() {
    const mergedDoc = new Document({ sections: this.sections });
    return await Packer.toBuffer(mergedDoc);
  }
}

module.exports = DocxMerger;

const fs = require("fs");
const unzipper = require("unzipper");
const JSZip = require("jszip");

async function mergeDocuments(buffers) {
  const zip = new JSZip();
  let mergedContent = [];

  for (const buffer of buffers) {
    zip.loadAsync(buffer);
    const doc = await Document.load(buffer);
    mergedContent.push(...doc.sections);
  }

  const mergedDoc = new Document({
    sections: mergedContent,
  });

  return await Packer.toBuffer(mergedDoc);
}

module.exports = { mergeDocuments };

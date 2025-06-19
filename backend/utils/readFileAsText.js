const fs = require('fs/promises');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const path = require('path');

async function readFileAsText(filePath, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();

  if (!ext) {
    throw new Error('File extension not found');
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (ext === '.pdf') {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.txt') {
    return await fs.readFile(filePath, 'utf8');
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = { readFileAsText };

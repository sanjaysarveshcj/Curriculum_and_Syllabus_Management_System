const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { readFileAsText } = require('../utils/readFileAsText');
const dotenv = require("dotenv")

dotenv.config()

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.resolve(req.file.path);
    const rawText = await readFileAsText(filePath, req.file.originalname);

    fs.unlinkSync(filePath); // optional: remove temp file

    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });

    const prompt = `
Extract the following syllabus data. Respond with ONLY a valid JSON object (no markdown, no explanation):

{
  "title": "",
  "subject": "",
  "objectives": "",
  "courseDescription": "",
  "prerequisites": "",
  "unit1Name": "", "unit1Hours": "", "unit1Content": "",
  "unit2Name": "", "unit2Hours": "", "unit2Content": "",
  "unit3Name": "", "unit3Hours": "", "unit3Content": "",
  "unit4Name": "", "unit4Hours": "", "unit4Content": "",
  "unit5Name": "", "unit5Hours": "", "unit5Content": "",
  "theoryPeriods": "", "practicalExercises": "", "practicalPeriods": "", "totalPeriods": "",
  "courseFormat": "", "assessments": "",
  "courseOutcomes" : "",
  "textBooks": "", "references": "",
  "ytResources": "", "webResources": "", "listOfSoftwares": "", "eBook": "",
  "L": "", "T": "", "P": "", "C": ""
}
rules:
1)for practical exercise map the content under them until the section next header arrives .
2)the content may not be structure, while passing as json make them structured ,like if it as mutiple point.
3)in the subject field pass the course code while passing the json.
4)while passing as JSON,separate content in course objectives, course outcomes, text books, references, web resources, list of softwares, e-book to separate lines, each new point should start with a new line. Remove any numbering like "1.", "2)", "-", "*", "CO1:", "C02:",etc.
5)if the content is not present in the syllabus, pass it as empty string in json. Don't pass null or undefined. 
6)practical exercise and coding exercise are not same , so dont treat them as same.
7)while passing as json structure every field properly if they are unstructure except for unit contents.
8)dont map coding exercise to practical exercises.
9)for the unit contents take everything under them until next header comes , it may also as coding exercises,assignments so map them as unit content.onlymap the content under the unit's content .
10)if total periods is not present, pass it as theory periods + practical periods.
11) in course outcomes if CO[x] then map it to that field until next CO[x] comes or the next section header comes.
TEXT:
${rawText}
`;

    const result = await model.generateContent(prompt);
    const fullResponse = result.response.text();

    // Extract only JSON part using RegExp
    const match = fullResponse.match(/\{[\s\S]*?\}/);
    console.log(fullResponse);
    if (!match) throw new Error('Failed to extract valid JSON from  output');

    const parsed = JSON.parse(match[0]);
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message || 'Extraction failed.' });
  }

});

module.exports = router;

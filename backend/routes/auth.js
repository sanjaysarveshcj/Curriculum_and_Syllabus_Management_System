const express = require('express');
const router = express.Router();
const { login, assignFaculty, assignHOD, getUsersByRole, addSubject, getSubjects, updateSubjectAssignments, updateSubject, getNotifications, markReadNot} = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');
const Notification = require('../models/notification')
const User = require('../models/users');
const Subject = require('../models/subjects');
const { getStorage } = require("../utils/gridfs");
const multer = require("multer")
const { getGFS } = require("../utils/gridfs");
const mongoose = require("mongoose");
const { Packer, Document } = require("docx");
const { Readable } = require("stream");
const { mergeDocuments } = require("../utils/docxMerger");
const { getGridFSBucket } = require("../utils/gridfs");
const DocxMerger = require('docx-merger');
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const Department = require('../models/department')
const Regulation = require('../models/Regulation')







router.post('/login', login);

router.post('/assign-hod', protect, authorize('superuser'), assignHOD);
router.post('/assign-faculty', protect, authorize('hod'), assignFaculty);

router.get("/by-role", getUsersByRole);

router.post("/add-subject", addSubject);
router.get("/get-subjects", getSubjects);
router.put("/update-fac-exp", updateSubjectAssignments);
router.put("/edit-subjects/:id", updateSubject);

router.get("/notifications/:userId", getNotifications);
router.put("/notifications/:id/mark-read", markReadNot);


router.get("/faculty-subjects/:facultyId", async (req, res) => {
  try {
    const subjects = await Subject.find({ assignedFaculty: req.params.facultyId }).populate("assignedExpert", "name email");
    res.json(subjects);
    console.log(subjects)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/faculty-upload", async (req, res) => {
  const { subjectId, fileId } = req.body;

  const updated = await Subject.findByIdAndUpdate(subjectId, {
    syllabusUrl: fileId,
    status: "Sent to Expert",
    updatedAt: new Date()
  }, { new: true });

  console.log("Incoming subjectId:", subjectId);
  console.log("Incoming fileId:", fileId);


  if (!updated) return res.status(404).json({ error: "Subject not found" });

  res.json({ message: "File linked", subject: updated });
});

router.put("/expert-feedback/:subjectId", async (req, res) => {
  try {
    const { status, feedback } = req.body; // status should be "Approved" or "Rejected"
    const subject = await Subject.findById(req.params.subjectId);

    if (!subject) return res.status(404).json({ error: "Subject not found" });

    subject.status = status;
    subject.feedback = feedback;
    await subject.save();

    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload", async (req, res) => {
  try {
    const storage = getStorage();
    const upload = multer({ storage }).single("file");

    upload(req, res, function (err) {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(500).json({ error: "Upload failed." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      console.log("Uploaded file:", req.file.id);
      res.status(200).json({ fileId: req.file.id, filename: req.file.filename });
    });
  } catch (err) {
    console.error("Storage init failed:", err);
    return res.status(500).json({ error: "Internal error." });
  }
});



// router.get("/file/:id", async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
//     const bucket = new mongoose.mongo.GridFSBucket(db, {
//       bucketName: "uploads",
//     });

//     const fileId = new mongoose.Types.ObjectId(req.params.id);

//     const filesCollection = db.collection("uploads.files");
//     const file = await filesCollection.findOne({ _id: fileId });

//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     res.set("Content-Type", file.contentType || "application/octet-stream");
//     res.set("Content-Disposition", `attachment; filename="${file.filename}"`);

//     const downloadStream = bucket.openDownloadStream(fileId);
//     downloadStream.pipe(res);
//   } catch (err) {
//     console.error("File download error:", err);
//     res.status(500).json({ error: "File download failed" });
//   }
// });


router.get("/file/:id", async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    const _id = new mongoose.Types.ObjectId(req.params.id);

    const file = await mongoose.connection.db.collection("uploads.files").findOne({ _id });
    if (!file) return res.status(404).json({ error: "File not found" });

    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${file.filename}"`);

    const stream = bucket.openDownloadStream(_id);
    stream.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});


// GET /api/auth/expert-subjects/:expertId
router.get("/expert-subjects/:expertId", async (req, res) => {
  try {
    const subjects = await Subject.find({ assignedExpert: req.params.expertId });

    // Populate faculty name if needed
    const enriched = await Promise.all(
      subjects.map(async (subj) => {
        const faculty = await User.findById(subj.assignedFaculty).select("name");
        return {
          ...subj._doc,
          facultyName: faculty?.name || "N/A",
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/auth.js
router.put("/send-to-hod", async (req, res) => {
  const { subjectId, fileId } = req.body;

    const updated = await Subject.findByIdAndUpdate(subjectId, {
      syllabusUrl: fileId,
      status: "Sent to HOD",
      updatedAt: new Date()
    }, { new: true });

    console.log("Incoming subjectId:", subjectId);
    console.log("Incoming fileId:", fileId);


    if (!updated) return res.status(404).json({ error: "Subject not found" });

    res.json({ message: "File linked", subject: updated });
});


router.put("/subject-status/:id", async (req, res) => {
  try {
    const { status, feedback } = req.body;

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        status,
        feedback: feedback || "",
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating subject status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/subject/:id/approve
router.put("/subject/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    subject.status = "Approved";
    subject.lastUpdated = new Date();
    subject.feedback = "";

    await subject.save();

    // Notify faculty
    const notification = new Notification({
      userId: subject.assignedFaculty,
      message: `Your syllabus for "${subject.title}" has been approved.`,
      timestamp: new Date(),
      read: false,
    });
    await notification.save();

    req.app.get("io").to(subject.assignedFaculty).emit(`notification:${subject.assignedFaculty}`, {
      _id: notification._id,
      message: notification.message,
      timestamp: notification.timestamp,
      read: false,
    });

    res.json({ message: "Syllabus approved", subject });
  } catch (err) {
    console.error("Approve error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/syllabus/:subjectId
router.get("/syllabus/:subjectId", async (req, res) => {
  const { subjectId } = req.params;
  try {
    const subject = await Subject.findById(subjectId);
    if (!subject || !subject.syllabusFile) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = await gfs.files.findOne({ filename: subject.syllabusFile });
    if (!file) return res.status(404).json({ error: "File not found in storage" });

    const readStream = gfs.createReadStream({ filename: file.filename });
    res.set("Content-Type", file.contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error("File fetch error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/auth/subject/:id/feedback
router.put("/subject/:id/feedback", async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    subject.status = "Rejected";
    subject.lastUpdated = new Date();
    subject.feedback = feedback;

    await subject.save();

    const notification = new Notification({
      userId: subject.assignedFaculty,
      message: `Your syllabus for "${subject.title}" was rejected. Feedback: ${feedback}`,
      timestamp: new Date(),
      read: false,
    });
    await notification.save();

    req.app.get("io").to(subject.assignedFaculty).emit(`notification:${subject.assignedFaculty}`, {
      _id: notification._id,
      message: notification.message,
      timestamp: notification.timestamp,
      read: false,
    });

    res.json({ message: "Feedback sent", subject });
  } catch (err) {
    console.error("Feedback error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// routes/auth.js
router.get("/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find({}, "_id title code syllabusUrl");
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

const upload = multer();

router.post("/curriculum/merge-docs", upload.fields([
  { name: "template" },
  { name: "electives" }
]), async (req, res) => {
  try {
    const syllabusUrls = JSON.parse(req.body.syllabusUrls || "[]"); // ✅ Make sure this is parsed
    const template = req.files.template?.[0];
    const electives = req.files.electives?.[0];

    if (!template || !electives) {
      return res.status(400).json({ error: "Required files missing." });
    }

    console.log("✔️ syllabusUrls:", syllabusUrls);
    console.log("✔️ Files received:", Object.keys(req.files));

    const bucket = getGridFSBucket();

    // Get syllabus docs from GridFS by file ID
    const syllabusBuffers = await Promise.all(
      syllabusUrls.map(async (id) => {
        const fileId = new mongoose.Types.ObjectId(id);
        const chunks = [];

        return new Promise((resolve, reject) => {
          bucket.openDownloadStream(fileId)
            .on("data", (chunk) => chunks.push(chunk))
            .on("end", () => resolve(Buffer.concat(chunks)))
            .on("error", (err) => reject(err));
        });
      })
    );

    const allBuffers = [
      template.buffer,
      electives.buffer,
      ...syllabusBuffers,
    ];

    // Merge all .docx files
    const merger = new DocxMerger();
    await merger.merge(allBuffers);

    const mergedBuffer = await merger.save();
    res.setHeader("Content-Disposition", "attachment; filename=FinalCurriculum.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(Buffer.from(mergedBuffer));
  } catch (err) {
    console.error("Merging failed:", err);
    res.status(500).json({ error: "Failed to merge documents." });
  }
});


router.post("/assign-expert", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.role.includes("subject-expert")) {
        existingUser.role.push("subject-expert");
        await existingUser.save();
        return res.status(200).json({ message: "Expert role added to existing user", user: existingUser });
      } else {
        return res.status(200).json({ message: "User already has subject-expert role", user: existingUser });
      }
    }

    const newExpert = new User({
      name,
      email,
      password,
      role: ["subject-expert"],
    });

    await newExpert.save();
    res.status(201).json({ message: "Expert created", user: newExpert });
  } catch (err) {
    console.error("Error assigning expert:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// routes/auth.js (or routes/user.js)
router.get("/hods", async (req, res) => {
  try {
    const hods = await User.find({ role: "hod" }).select("name _id email department");
    res.json(hods);
  } catch (err) {
    console.error("Failed to fetch HODs", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find().populate("hod", "name");
    const result = departments.map((dept) => ({
      _id: dept._id,
      name: dept.name,
      hodName: dept.hod?.name || "Not Assigned",
    }));
    res.json(result);
  } catch (err) {
    console.error("Failed to fetch departments", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/change-hod", async (req, res) => {
  const { departmentId, newHodId } = req.body;

  if (!departmentId || !newHodId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ error: "Department not found" });

    department.hod = newHodId;
    await department.save();

    // Update the user's department field (optional)
    await User.findByIdAndUpdate(newHodId, { department: department.name });

    res.json({ message: "HOD updated successfully" });
  } catch (err) {
    console.error("Failed to change HOD", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/create-department", async (req, res) => {
  try {
    const { name, hodId } = req.body;

    if (!name) return res.status(400).json({ error: "Department name is required" });

    // Check for duplicate
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ error: "Department already exists" });

    // Create department
    const department = new Department({ name, hod: hodId || null });
    await department.save();

    // Optionally update user role/department if hodId is given
    if (hodId) {
      await User.findByIdAndUpdate(hodId, { department: name });
    }

    res.status(201).json({ message: "Department created successfully", department });
  } catch (err) {
    console.error("Failed to create department:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /api/auth/regulations
router.get("/regulations", async (req, res) => {
  try {
    const regs = await Regulation.find().populate("hod", "name");
    
    // Group by regulationCode
    const grouped = regs.reduce((acc, curr) => {
      const code = curr.regulationCode;
      if (!acc[code]) acc[code] = [];
      acc[code].push({
        department: curr.department,
        hod: curr.hod.name,
        curriculumUrl: curr.curriculumUrl,
        lastUpdated: curr.lastUpdated,
      });
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/create-regulation", async (req, res) => {
  const { code } = req.body;

  console.log(req.body)

  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code is required" });

  try {
    const existing = await Regulation.findOne({ regulationCode: code });
    if (existing) return res.status(400).json({ error: "Regulation already exists" });

    const departments = await Department.find();
    const newEntries = await Promise.all(
      departments.map((dept) =>
        Regulation.create({
          regulationCode: code,
          department: dept.name,
          hod: dept.hod,
          curriculumUrl: null,
          lastUpdated: null,
        })
      )
    );

    res.json({ message: "Regulation created", data: newEntries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// routes/auth.js or routes/department.js
router.put("/departments/:id", async (req, res) => {
  const { name, hod } = req.body;

  try {
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { name, hod },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Department not found" });

    res.json({ message: "Updated successfully", data: updated });
  } catch (err) {
    console.error("Update error", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/upload-curriculum", async (req, res) => {
  try {
    const { regulationCode, department, fileId } = req.body;

    console.log(req.body);

    if (!regulationCode || !department || !fileId) {
      return res.status(400).json({ error: "Missing regulation or department or file" });
    }

    // Update regulation record
    const updated = await Regulation.findOneAndUpdate(
      { regulationCode, department },
      {
        curriculumUrl: fileId,
        status: "Submitted",
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Regulation entry not found" });
    }

    res.status(200).json({
      message: "Curriculum uploaded and regulation updated",
      regulation: updated, // Return the updated regulation instead of req.file.id
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;

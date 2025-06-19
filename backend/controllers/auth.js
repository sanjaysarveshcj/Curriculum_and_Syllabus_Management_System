const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Subject = require('../models/subjects');
const Notification = require('../models/notification')
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, department: user.department },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const hasRole = user.role.includes(role);
    if (!hasRole) {
      return res.status(403).json({ error: `Access denied for selected role: ${role}` });
    }

    const token = generateToken(user);

    res.json({ token, user });

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};




exports.assignFaculty = async (req, res) => {
  const { name, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        if (!existingUser.role.includes("faculty")) {
          existingUser.role.push("faculty");
          await existingUser.save();
          return res.status(200).json({ message: "Faculty role added to existing user", user: existingUser });
        } else {
          return res.status(200).json({ message: "User already has faculty role", user: existingUser });
        }
      }
  
      const newFaculty = new User({
        name,
        email,
        password,
        role: ["faculty"],
      });
  
      await newFaculty.save();
      res.status(201).json({ message: "Faculty created", user: newFaculty });
    } catch (err) {
      console.error("Error assigning faculty:", err);
      res.status(500).json({ error: "Server error" });
    }
};

exports.assignHOD = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      if (!existing.role.includes("hod")) {
        existing.role.push("hod");
        await existing.save();
        return res.status(200).json({ message: "HOD role added to existing user", user: existing });
      } else {
        return res.status(200).json({ message: "User already has HOD role", user: existing });
      }
    }
    const user = new User({
      name,
      email,
      password,
      role: ["hod"],
      department,
    });

    await user.save();
    res.status(201).json({ message: "HOD created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  const { role } = req.query;

  if (!role) {
    console.warn("⚠️ No role provided");
    return res.status(400).json({ error: "Role query parameter is required" });
  }

  try {
    const users = await User.find({ role: role }).select("name email");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addSubject = async (req,res) => {
  try {
    const { code, title, createdBy } = req.body;

    if (!code || !title) return res.status(400).json({ error: "Missing fields" });

    const newSubject = new Subject({ code, title, createdBy });
    await newSubject.save();

    res.status(201).json({ message: "Subject created", subject: newSubject });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}

exports.getSubjects = async (req, res) => {
  try {
    const { createdBy } = req.query;
    const filter = createdBy ? { createdBy } : {};
    const subjects = await Subject.find(filter);

    res.json(subjects);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err.message);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

exports.updateSubjectAssignments = async (req, res) => {
  try {
    const { subjectId, assignedFaculty, assignedExpert } = req.body;
    const io = req.app.get("io");

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    if (assignedFaculty !== undefined && assignedFaculty !== subject.assignedFaculty) {
      const notif = await Notification.create({
        userId: assignedFaculty,
        message: `You have been assigned as a faculty to the subject "${subject.title}"`,
        timestamp: new Date(),
        read: false,
      });

      io.to(assignedFaculty).emit(`notification:${assignedFaculty}`, notif);

      await User.findByIdAndUpdate(assignedFaculty, {
        $addToSet: { assignedSubjects: subject._id },
      });

      subject.assignedFaculty = assignedFaculty;
    }

    // Assign Expert
    if (assignedExpert !== undefined && assignedExpert !== subject.assignedExpert) {
      const notif = await Notification.create({
        userId: assignedExpert,
        message: `You have been added as a subject expert for "${subject.title}"`,
        timestamp: new Date(),
        read: false,
      });

      io.to(assignedExpert).emit(`notification:${assignedExpert}`, notif);

      await User.findByIdAndUpdate(assignedExpert, {
        $addToSet: { assignedSubjects: subject._id },
      });

      subject.assignedExpert = assignedExpert;
    }

    await subject.save();
    res.status(200).json({ message: "Assignments updated", subject });
  } catch (err) {
    console.error("Assignment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, assignedFaculty, assignedExpert } = req.body;
    const io = req.app.get("io");

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // Faculty change
    if (assignedFaculty && assignedFaculty !== subject.assignedFaculty) {
      if (subject.assignedFaculty) {
        // Notify old faculty
        const notif = await Notification.create({
          userId: subject.assignedFaculty,
          message: `You have been removed from the subject "${subject.title}"`,
          timestamp: new Date(),
          read: false,
        });
        io.to(subject.assignedFaculty).emit(`notification:${subject.assignedFaculty}`, notif);

        // Remove subject from old faculty
        await User.findByIdAndUpdate(subject.assignedFaculty, {
          $pull: { assignedSubjects: subject._id },
        });
      }

      // Notify new faculty
      const newNotif = await Notification.create({
        userId: assignedFaculty,
        message: `You have been assigned as a faculty to the subject "${title}"`,
        timestamp: new Date(),
        read: false,
      });
      io.to(assignedFaculty).emit(`notification:${assignedFaculty}`, newNotif);

      await User.findByIdAndUpdate(assignedFaculty, {
        $addToSet: { assignedSubjects: subject._id },
      });

      subject.assignedFaculty = assignedFaculty;
    }

    // Expert change
    if (assignedExpert && assignedExpert !== subject.assignedExpert) {
      if (subject.assignedExpert) {
        const notif = await Notification.create({
          userId: subject.assignedExpert,
          message: `You have been removed as a subject expert from "${subject.title}"`,
          timestamp: new Date(),
          read: false,
        });
        io.to(subject.assignedExpert).emit(`notification:${subject.assignedExpert}`, notif);

        await User.findByIdAndUpdate(subject.assignedExpert, {
          $pull: { assignedSubjects: subject._id },
        });
      }

      const newNotif = await Notification.create({
        userId: assignedExpert,
        message: `You have been added as a subject expert for "${title}"`,
        timestamp: new Date(),
        read: false,
      });
      io.to(assignedExpert).emit(`notification:${assignedExpert}`, newNotif);

      await User.findByIdAndUpdate(assignedExpert, {
        $addToSet: { assignedSubjects: subject._id },
      });

      subject.assignedExpert = assignedExpert;
    }

    // Update code/title if needed
    subject.code = code || subject.code;
    subject.title = title || subject.title;

    await subject.save();

    res.json(subject);
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markReadNot = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/users.js')

dotenv.config()

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const principalExists = await User.findOne({ email: "principal@college.edu" })
    const coeExists = await User.findOne({ email: "coe@college.edu" })

    if (!principalExists) {
      await User.create({
        name: "Principal",
        email: "principal@college.edu",
        password: "principal123", // will be hashed automatically
        role: ["superuser"],
      })
      console.log("✅ Principal seeded")
    }

    if (!coeExists) {
      await User.create({
        name: "COE",
        email: "coe@college.edu",
        password: "coe123", // will be hashed automatically
        role: ["superuser"],
      })
      console.log("✅ COE seeded")
    }

    process.exit()
  } catch (error) {
    console.error("❌ Error seeding admins:", error)
    process.exit(1)
  }
}

seedAdmins()

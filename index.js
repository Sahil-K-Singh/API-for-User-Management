const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // To handle JSON POST requests

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/mongo_tutorial")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    joinTitle: { type: String },
    gender: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Routes

// GET all users (HTML view)
app.get("/user", async (req, res) => {
  try {
    const dbUsers = await User.find({});
    const html = `<ul>${dbUsers
      .map((user) => `<li>${user.firstName} - ${user.email}</li>`)
      .join("")}</ul>`;
    res.send(html);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// POST a new user
app.post("/api/users", async (req, res) => {
  try {
    const { first_name, last_name, email, gender, job_title } = req.body;

    if (!first_name || !last_name || !email || !gender || !job_title) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    const result = await User.create({
      firstName: first_name,
      lastName: last_name,
      email,
      gender,
      joinTitle: job_title,
    });

    console.log("User created:", result);
    return res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

// GET, PATCH, DELETE user by ID
app
  .route("/api/user/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  })
  .patch(async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { lastName: "changed" },
        { new: true }
      );
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      return res.json(updatedUser);
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  })
  .delete(async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });
      return res.json({ status: "success", deletedUser });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  });

// Start the server
app.listen(port, () => console.log(`Server started at port ${port}`));

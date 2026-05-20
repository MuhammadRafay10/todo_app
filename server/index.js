const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models aur Middleware Imports
const User = require("./models/User");
const Todo = require("./models/Todo");
const auth = require("./middleware/auth"); // Security guard middleware

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Securely!"))
  .catch(err => console.log(err));

// ==========================================
//          AUTHENTICATION ROUTES
// ==========================================

// 1. SIGNUP: Naya Account Banane Ke Liye
app.post("/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username pehle se maujood hai!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "Account kamyabi se ban gaya hai!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN: Account Verify Karke Token Dene Ke Liye
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Galat Username ya Password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Galat Username ya Password!" });
    }

    // Token generate karna
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
//       SECURE TODOS ROUTES (With 'auth')
// ==========================================

// 1. GET: Sirf logged-in user ke todos mangwana
app.get("/todos", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user }); // req.user hamiain auth middleware se milta hai
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST: Todo ko specific user ke account mein save karna
app.post("/todos", auth, async (req, res) => {
  try {
    const todo = new Todo({ 
      text: req.body.text,
      user: req.user // Todo model mein user ki ID map kar di
    });
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT: Sirf apne hi todo ko update karne ki ijazat dena
app.put("/todos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Is se check hoga ke ID bhi sahi ho aur banaya bhi isi user ne ho
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user },
      { text: text },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found or unauthorized!" });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE: Sirf apne hi todo ko urane ki ijazat dena
app.delete("/todos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete({ _id: id, user: req.user });
    
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found or unauthorized!" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
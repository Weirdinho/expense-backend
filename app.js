const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const db = require("./db/db");
const { readdirSync } = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/User"); // Your User model
// const sendExpenseMail = require("./Mail/sendExpenseMail");
const app = express();
db();

require("dotenv").config(); 

const PORT = process.env.PORT;

//middlewares
app.use(express.json());
app.use(cors({
  origin: "*", // Or specify exact origin
    credentials: true,
}));  

//Routes
readdirSync("./routes").map((route) =>
  app.use("/api/v1", require("./routes/" + route))
);

app.use("/api", authRoutes);

const router = express.Router();
router.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if email already exists
    let existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email is already in use" });

    // Check if username already exists
    let existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username is already taken" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create and save the user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, "SECRET_KEY", { expiresIn: "1h" });

    res.json({ token, username: newUser.username });
  } catch (err) {
    res.status(500).json({ message: "Server Error. Please try again later." });
  }
});

// Login Route
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, "SECRET_KEY", { expiresIn: "1h" });

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server Error. Please try again later." });
  }
});


//Function to send mail
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com", 
  port: 465,
  secure: true,  
  auth: {
    user: "ruruwhygee@gmail.com",
    pass: "fyzcoirujgiqfsyy", 
  },
});

app.post("/api/v1/add-expense", async (req, res) => {
  try {
    const expense = req.body;
    // Save expense to database here (if applicable)
    const sendExpenseMail = async (expense) => {
      const mailOptions = {
        from: "ruruwhygee@gmail.com",
        to: "ruruwhygee@gmail.com",
        subject: "New Expense Added",
        text: `An expense has been added:\n\nTitle: ${expense.title}\nAmount: ${expense.amount}\nDate: ${expense.date}\nCategory: ${expense.category}\nDescription: ${expense.description}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Expense email sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };
    // Send email notification
    await sendExpenseMail(expense);

    res.status(201).json({ message: "Expense added and email sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

//INCOME
app.post("/api/v1/add-income", async (req, res) => {
  try {
    const income = req.body;
    // Save expense to database here (if applicable)
    const sendExpenseMail = async (income) => {
      const mailOptions = {
        from: "ruruwhygee@gmail.com",
        to: "ruruwhygee@gmail.com",
        subject: "New Income Added",
        text: `An income has been added:\n\nTitle: ${income.title}\nAmount: ${income.amount}\nDate: ${income.date}\nCategory: ${income.category}\nDescription: ${income.description}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Expense email sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };
    // Send email notification
    await sendExpenseMail(income);

    res.status(201).json({ message: "Income added and email sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

const server = () => {
  app.listen(PORT, () => {
    console.log(
      "You are about to witness the strength of street knowledge:",
      PORT
    );
  });
};

server();

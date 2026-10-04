const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test PostgreSQL connection
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((error) => {
    console.error("❌ PostgreSQL connection error:", error.message);
  });

// Test route
app.get("/", (req, res) => {
  res.send("CodeXYZ backend is running!");
});
// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, company, project_type, message } = req.body;

    // Basic validation
    if (!name || !email || !project_type || !message) {
      return res.status(400).json({
        error: "Please fill in all required fields.",
      });
    }

    // Save message to PostgreSQL
    const result = await pool.query(
      `INSERT INTO contact_messages
          (name, email, company, project_type, message)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
      [name, email, company || null, project_type, message]
    );

    res.status(201).json({
      success: true,
      message: "Message saved successfully!",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    res.status(500).json({
      error: "Could not save your message.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

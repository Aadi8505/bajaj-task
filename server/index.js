const express = require("express");
const cors = require("cors");
const path = require("path");
const processData = require("./processData");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, "../client/dist")));

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res
        .status(400)
        .json({ error: 'Invalid request body. "data" must be an array of strings.' });
    }

    const result = processData(data);
    return res.json(result);
  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// SPA catch-all — serve index.html for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl"); // Make sure this model is defined correctly
const app = express();

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost/urlShortener", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Set up EJS as the view engine
app.set("view engine", "ejs");

// Parse URL-encoded bodies (from forms)
app.use(express.urlencoded({ extended: false }));

// Home page route
app.get("/", async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render("index", { shortUrls: shortUrls });
  } catch (error) {
    res.status(500).send("Error retrieving URLs.");
  }
});

// Create short URL route
app.post("/shorturl", async (req, res) => {
  try {
    const fullUrl = req.body.fullURL;
    await ShortUrl.create({ full: fullUrl });
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating short URL.");
  }
});

// Redirect short URL to full URL route
app.get("/:shortUrl", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) return res.status(404).send("URL not found");

    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
  } catch (error) {
    res.status(500).send("Error redirecting URL.");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

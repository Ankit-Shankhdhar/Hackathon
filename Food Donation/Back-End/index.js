const { Database } = require("quickmongo");
const express = require("express");
const color = require("colors");
const mongoose = require("mongoose");
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
//Cache Files
const cc = require("./config.json");

mongoose.connect(cc.mongodb).then(async () => {
  console.log(color.bold.red("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+="));
  console.log(
    color.bold.cyan(`---------------------------------------------------`)
  );
  console.log(color.bold.yellow(`Mongoose Connected`));
  console.log(
    color.bold.cyan(`---------------------------------------------------`)
  );
  console.log(color.bold.red("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+="));
});

// Schema

const donateData = new mongoose.Schema({
  name: String,
  number: Number,
  amount: Number,
  message: String,
  state: String,
});

const donation = mongoose.model("Donation", donateData);

//URL
const domain = "45.55.195.4";

const db = new Database(cc.mongodb);
db.connect();
db.on("ready", async () => {
  console.log(color.bold.red("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+="));
  console.log(
    color.bold.cyan(`---------------------------------------------------`)
  );
  console.log(color.bold.yellow(`Database Connected`));
  console.log(
    color.bold.cyan(`---------------------------------------------------`)
  );
  console.log(color.bold.red("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+="));
});

const app = new express();
app.use(express.static("public"));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

port = 3030;
app.get("/api/login/:email/:password", async (req, res) => {
  console.warn(req.params.email);
  console.warn(req.params.password);
  const email = req.params.email;
  const password = req.params.password;
  try {
    const emails = await db.getArray("emails");
    if (emails.includes(email)) {
      const pass = await db.get(`all-mail.${email}.pass`);
      if (password == pass) {
        res.json({ success: true, message: "Login Successful" });
      } else {
        res.json({ success: false, message: "Incorrect Password" });
      }
    } else {
      res.json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/", async function (req, res) {
  res.redirect(`https://${domain}:${port}/login`);
});
app.get("/login", async function (req, res) {
  console.log("Checking");
  const filePath = path.join(__dirname, "..", "Front-End", "login.html");
  console.log(filePath);
});

app.get("/api/continue/:name/:email/:password", async (req, res) => {
  console.warn(req.params.name);
  console.warn(req.params.email);
  console.warn(req.params.password);
  const name = req.params.name;
  const email = req.params.email;
  const pass = req.params.password;
  try {
    const emails = await db.getArray("emails");
    console.log(emails);
    if (emails.includes(email)) {
      res.json({ success: false, message: "This Email is Already Used" });
    } else {
      await db.push(`emails`, email);
      await db.set(`all-mail.${email}.pass`, pass);
      await db.set(`all-mail.${email}.name`, name);
      res.json({ success: true, message: "Registration Successfull" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://${domain}:${port}`);
});

//Certification
app.get(
  "/api/certificate/:name/:number/:amount/:message/:state",
  async (req, res) => {
    console.warn(req.params.name);
    console.warn(req.params.number);
    console.warn(req.params.amount);
    console.warn(req.params.message);
    console.warn(req.params.state);
    const name = req.params.name;
    const getNumber = Number(req.params.number);
    const getAmount = Number(req.params.amount);
    const message = req.params.message;
    const state = req.params.state;
    const test = await new donation({
      name: name,
      number: getNumber,
      amount: getAmount,
      message: message,
      state: state,
    });

    await test.save((err, donate) => {
      if (err) return console.error(err);
      console.log("User saved:", donate);
    });

    res.json({ success: true, message: "Donation Successfull" });

    registerFont("./font.ttf", {
      family: "Alex Brush",
    });

    async function addTextToImage(inputImagePath, outputImagePath, text) {
      const image = await loadImage(inputImagePath);

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const fontSize = 150;
      const textColor = "#000000";

      ctx.font = `${fontSize}px 'Alex Brush', cursive`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate text position (centered)
      const x = canvas.width / 2;
      const y = canvas.height / 2.2;

      ctx.fillText(text, x, y);

      const stream = fs.createWriteStream(outputImagePath);
      const pngStream = canvas.createPNGStream();
      pngStream.pipe(stream);
      return new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });
    }

    const inputImagePath = "./image.png";
    const outputDirectory = "./";
    const outputImageName = `./certificates/certificate_${name}`;
    const outputImagePath = `${outputDirectory}${outputImageName}.png`;
    const textToAdd = name;

    addTextToImage(inputImagePath, outputImagePath, textToAdd)
      .then(() => console.log("Text added to image."))
      .catch((error) => console.error("Error:", error));
  }
);

app.get("/api/certificates/:name", async (req, res) => {
  console.log(req.params.name);
  const name = req.params.name;
  const file = `${__dirname}/certificates/certificate_${name}`;
  res.sendFile(file);
});

app.get("/api/alldata", async (req, res) => {
  const data = await donation.find({});
  const extractedData = data.map(({ name, amount, message }) => ({
    name,
    amount,
    message,
  }));
  res.json(extractedData);
});

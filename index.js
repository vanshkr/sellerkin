import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
dotenv.config();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

const BREVO_API_ENDPOINT = process.env.ENDPOINT;

app.post("/submit", (req, res) => {
  const { name, email } = req.body;

  const mailOptions = {
    from: process.env.SENDER_MAIL,
    to: email,
    subject: "Way To Go",
    text: `Thanks for Subscribing, ${name}.`,
  };

  transporter.sendMail(mailOptions, (error, _) => {
    if (error) {
      //   console.error("Error sending email:", error);
      res.status(500).send("Failed to send email");
    } else {
      //   console.log("Email sent:", info.response);
      res.send("Email sent successfully");

      const brevoRequest = http.request(BREVO_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.API_KEY,
        },
      });
      brevoRequest.end();
    }
  });
});

app.get("/", (_, res) => {
  res.send(`
    <form id="submitForm" action="/submit" method="post">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required><br><br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required><br><br>
      <button type="submit">Submit</button>
    </form>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

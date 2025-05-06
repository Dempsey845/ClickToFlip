import nodemailer from "nodemailer";
import express from "express";

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Email setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "clicktoflipcontact@gmail.com",
      pass: "gxor otaw frzx smyd",
    },
  });

  const mailOptions = {
    from: email,
    to: "clicktoflipcontact@gmail.com",
    subject: `Contact form submission from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Message could not be sent" });
  }
});

export default router;

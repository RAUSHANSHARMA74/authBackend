const nodemailer = require("nodemailer");

async function sendMail(userEmail, friendName) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amankumarq741@gmail.com",
        pass: "mcjqyvfwvpkolqtr",
      },
    });

    // Email content
    const mailOptions = {
      from: "amankumarq741@gmail.com",
      to: userEmail,
      subject: "🎉 Let's ROFL Together! 🤣",
      text: `
      Hey ${friendName},

      I couldn't wait to show you this! 😄 Look at the hilarious meme I found:
      
      1. https://youtube.com/shorts/VXs4-LGi05U?feature=share
      2. https://youtube.com/shorts/rZ_vX3qVBV0?feature=share
      
      Hope it brings a smile to your face!
      
      Chat soon,
      
      Prince😎
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.send("send mail");
  } catch (error) {
    console.log("wrong in /mail");
  }
}

module.exports = { sendMail };

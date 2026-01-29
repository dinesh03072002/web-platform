const Newsletter = require("../models/newsletter_model");
const sendMail = require("../config/mail");

exports.subscribe = async (email) => {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    // Save subscriber
    const subscriber = await Newsletter.create({ email });

    //Notify ADMIN
    await sendMail(
      "dineshyuvi9@gmail.com", 
      "New Newsletter Subscription",
      `
        <h3>New Newsletter Subscriber</h3>
        <p><b>Email:</b> ${email}</p>
      `
    );

    //Auto-reply to SUBSCRIBER
    await sendMail(
      email, // subscriber email
      "Subscription Confirmed",
      `
        <p>Hi,</p>
        <p>Thank you for subscribing to our newsletter!</p>
        <p>You’ll now receive updates and announcements from us.</p>

        <p>Regards,<br/><b>Team</b></p>
      `
    );

    return subscriber;
  } catch (error) {
    throw error;
  }
};

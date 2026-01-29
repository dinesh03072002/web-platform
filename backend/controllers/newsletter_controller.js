const service = require("../services/newsletter_service");

exports.subscribe = async (req, res) => {
  try {
    const email = await service.subscribe(req.body.email);
    res.status(201).json(email);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



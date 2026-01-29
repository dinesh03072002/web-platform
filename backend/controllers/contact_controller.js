const service = require("../services/contact_services");

exports.create = async (req, res) => {
  try {
    const contact = await service.createContact(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


 
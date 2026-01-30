const adminService = require("../services/admin_service");


exports.getContacts = async (req, res) => {
  try {
    const contacts = await adminService.getAllContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const subs = await adminService.getAllSubscribers();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD USER 
exports.addUser = async (req, res) => {
  try {
    const message = await adminService.addUserByAdmin(
      req.user.id,
      req.body
    );
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ADMIN ORGANIZATION 
exports.getOrganization = async (req, res) => {
  try {
    const org = await adminService.getAdminOrganization(req.user.id);

   
    if (!org) {
      return res.json({ organization_name: null });
    }
 
    res.json({ organization_name: org.name });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await adminService.getUsers(req.user.id);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      contact: u.contact,
      role: u.role,
      createdAt: u.createdAt,
      organization_name: u.Organization ? u.Organization.name : null,
    }));

    res.json(formattedUsers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const message = await adminService.updateUser(
      req.user.id,
      req.params.id,
      req.body 
    );
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


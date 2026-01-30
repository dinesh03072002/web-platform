const authService = require("../services/auth_service");

// REGISTER 
exports.register = async (req, res) => {
  try {
    const message = await authService.register(req.body);
    res.status(201).json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
  
// VERIFY EMAIL  
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    await authService.verifyEmail(token);

    // redirect to frontend verify-email page
    return res.redirect(
      `${process.env.APP_URL}/verify-email?status=success`
    );
  } catch (err) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent(err.message)}`
    );
  }
};



// LOGIN 
exports.login = async (req, res) => {
  try {
    const token = await authService.login(req.body);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};


// FORGOT PASSWORD 
exports.forgotPassword = async (req, res) => {
  try {
    const message = await authService.forgotPassword(req.body.email);
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  try {
    const message = await authService.resetPassword(req.body);
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
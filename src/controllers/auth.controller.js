// src/controllers/auth.controller.js

const userViewModel = require('../viewmodels/user.viewmodel'); // Ensure only one instance

exports.signup = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    console.log(username);
    console.log(password);
    console.log(email);
    console.log(role);

    const user = await userViewModel.signup(username, password, email, role);

    // Remove keys with null values from the user object
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== null)
    );

    res.status(201).json({ success: true, data: filteredUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userViewModel.login(email, password);
     // Remove keys with null values from the user object
     const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== null)
    );
    res.status(200).json({ success: true, token, data: filteredUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


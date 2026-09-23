const User = require('../models/user');
const { setAuthCookies } = require('../utils/cookieutil');


const loginuser = async (req, res) => {

    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const existinguser = await User.findOne({email}).select('+password');

        if (!existinguser) {
            return res.status(404).json({ message: "user not found" });
        }
        const isMatch = existinguser.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = existinguser.generateToken();
        const refreshToken = existinguser.generateRefreshToken();
        setAuthCookies(res, token, refreshToken);
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: existinguser._id,
                email: existinguser.email,
                role: existinguser.role || "user",
                success: true
            }
        });

    } catch (err) {
        console.log("Error occurred while login", err.message);
        res.status(500).json({ message: err.message });
    }
}

const adduser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: "Password must contain a mix of letters and numbers" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const newUser = await User.create({ email, password });

    
    const token = newUser.generateToken();
    const refreshToken = newUser.generateRefreshToken();
    setAuthCookies(res, token, refreshToken);

 
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role || "user",
      }
    });

  } catch (err) {
    console.log("Error occurred in signup", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
    loginuser,adduser
}


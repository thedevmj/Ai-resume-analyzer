const express=require('express');
const { adduser, loginuser } = require('../controller/usercontroller');
const { refreshAccessToken } = require('../controller/refreshtokencontroller');
const { clearAuthCookies } = require('../utils/cookieutil');
const { loginLimiter, registerLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const router=express.Router();

router.post("/register", registerLimiter, adduser);
router.post("/login", loginLimiter, loginuser);
router.post("/refresh", refreshLimiter, refreshAccessToken);
router.post("/logout", (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports=router;
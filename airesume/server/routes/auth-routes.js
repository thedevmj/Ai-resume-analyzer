const express=require('express');
const { adduser, loginuser } = require('../controller/usercontroller');
const router=express.Router();

router.post("/register",adduser);
router.post("/login",loginuser);
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports=router;
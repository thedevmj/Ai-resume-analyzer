const express=require('express');
const { adduser, loginuser } = require('../controller/usercontroller');
const router=express.Router();

router.post("/register",adduser);
router.post("/login",loginuser);

module.exports=router;
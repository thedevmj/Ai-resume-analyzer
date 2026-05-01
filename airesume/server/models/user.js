const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const userSchema = mongoose.Schema({
   
    email: {
        type: String
    }
    ,
    password: {
        type: String
    }

})

userSchema.pre('save', function (next) {
    const gensalt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, gensalt);
    next();
})

userSchema.methods.generateToken=function(){
    return jwt.sign({id:this._id,email:this.email},process.env.jwt_secret,{expiresIn:process.env.jwt_expire});
}



module.exports = mongoose.model('user', userSchema); 


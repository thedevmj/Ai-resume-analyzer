const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema({

    email: {
        type: String
    }
    ,
    password: {
        type: String
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    }

})

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) { return next(); }
    const gensalt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, gensalt);
    next();
})

userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id, email: this.email }, process.env.jwt_secret, { expiresIn: process.env.jwt_expire });
}

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user', userSchema);


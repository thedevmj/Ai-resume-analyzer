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

userSchema.pre('save', function () {
    if (!this.isModified('password')) { return; }
    const gensalt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, gensalt);
})

userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id, email: this.email, role: this.role }, process.env.jwt_secret, { expiresIn: process.env.jwt_expire });
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id, email: this.email, role: this.role }, process.env.jwt_refresh_secret, { expiresIn: process.env.jwt_refresh_expire });
}

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user', userSchema);


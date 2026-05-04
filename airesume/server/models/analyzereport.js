const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    }
    ,
    analysis: [{
        type: mongoose.Schema.Types.Mixed,
        required: true
    }]
    



})
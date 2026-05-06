const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    analysis: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    feedback: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number,
        default: 0
    }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
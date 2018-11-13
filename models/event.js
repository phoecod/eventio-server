const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    title: {type: String, unique: true, lowercase: true},
    description: String,
    date: {type: Date},
    capacity: {type: Number, required: true},
    host: { type: Schema.Types.ObjectId, ref: 'user' },
    users : [{ type: Schema.Types.ObjectId, ref: 'user' }]
});

const ModelClass = mongoose.model('event', userSchema);

module.exports = ModelClass;
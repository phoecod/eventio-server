const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email: {type: String, unique: true, lowercase: true},
    password: {type: String, unique: true},
    first_name: String,
    last_name: String,
    events : [{ type: Schema.Types.ObjectId, ref: 'event' }]
});

userSchema.pre('save', function(next) {
    const user = this;

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    })
});

userSchema.methods.comparePassword= function(candidPass, callback) {
    bcrypt.compare(candidPass, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
}

const ModelClass = mongoose.model('user', userSchema);

module.exports = ModelClass;
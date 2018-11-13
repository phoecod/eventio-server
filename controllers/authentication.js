const jwt = require('jwt-simple');
const config = require('../config');
const User = require('../models/user');
const validator = require('email-validator');

function tokenForUser (user) {
    const timestame = new Date().getTime();
    return jwt.encode({sub: user.id, iat: timestame}, config.secret);
}

exports.signin = (req, res, next) => {
    //user needs token
    const user = req.body;
    User.findOne({email: user.email}, (err, existingUser) => { 
        const currentUser = {
            id: existingUser._id,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            name: existingUser.first_name + ' ' + existingUser.last_name
        }
        res.send({
            token: tokenForUser(currentUser),
            user: currentUser
        });
    });
}

exports.signup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    // check for duplicate users by email
    if (!email || !password) {
        return res.status(422).send({error: 'You must provide email and password'});
    }
    //validates email format
    if (!validator.validate(email)) return res.status(422).send({error: 'Invalid email format'})
    // see if a user with the given email exists
    User.findOne({email: email}, (err, existingUser) => { 
        if (err) {return next(err)}

        // if duplicate found, return error
        if (existingUser) {
            return res.status(422).send({error: 'Oops! Email is in use'});
        }
        // if not, create and save record and return
        const user = new User({
            first_name,
            last_name,
            email,
            password
        });
        user.save((err, savedUser) => {
            const sentUser = {
                id: savedUser._id,
                first_name: savedUser.first_name,
                last_name: savedUser.last_name,
                name: savedUser.first_name + ' ' + savedUser.last_name
            }
            if (err) {return next(err); }
            res.json(
                {
                    token: tokenForUser(savedUser),
                    user: sentUser
                }
            );
        });
        
    });
}
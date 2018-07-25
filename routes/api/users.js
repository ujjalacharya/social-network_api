const router = require('express').Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport')
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// @@ POST api/users/register
// @@ desc Register User
// @@ access Public
router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email = 'Email already exists'
                res.status(400).json(errors)
            } else {
                let avatar = gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' });
                let newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) console.log(err);
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    });
                });
            }
        })

})

// @@ POST api/users/login
// @@ desc Logs in User
// @@ access Public
router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    } 
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                errors.email = 'User not found'
                res.status(404).json(errors)
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = { id: user.id, name: user.name, avatar: user.avatar }

                            jwt.sign(payload,
                                keys.secret,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    res.json({
                                        success: true,
                                        token: 'Bearer ' + token
                                    })
                                })
                        } else {
                            errors.password = 'Incorrect password'
                            res.status(400).json(errors)
                        }
                    });
            }
        })
})

router.get('/secure', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
})
module.exports = router;
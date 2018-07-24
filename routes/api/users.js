const router = require('express').Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport')

// @@ POST api/users/register
// @@ desc Register User
// @@ access Public
router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                res.status(400).json({ email: 'Email already exists' })
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
                        if (err) throw err;
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
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                res.status(404).json({ email: 'User not found' })
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
                            res.status(400).json({ password: 'Incorrect password' })
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
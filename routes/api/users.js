const router = require('express').Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar')

// @@ POST api/users/register
// @@ desc Register User
// @@ access Public
router.post('/register', (req, res)=>{
    User.findOne({email: req.body.email})
        .then(user =>{
            if(user){
                res.status(400).json({email: 'Email already exists'})
            }else{
                let avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
                let newUser =new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                                .then(user => res.json(user))
                                .catch(err => console.log(err))
                    });
                });
        }
        })
        
})

module.exports = router;
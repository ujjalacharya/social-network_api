const router = require('express').Router();
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const passport = require('passport');

router.get('/test', (req, res)=>{
    res.json({test: 'Profile route work'})
})

// @@ GET api/profilr
// @@ desc Get current user's profile
// @@ access Private
router.get('/',passport.authenticate('jwt', { session: false }), (req, res)=>{
    let errors = {};
    Profile.findOne({user: req.id})
        .then(profile=>{
            if(!profile){
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
})

module.exports = router;
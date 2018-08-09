const router = require('express').Router();
const Profile = require('../../models/Profile');
const passport = require('passport');
const validateProfile = require('../../validation/profile');
const validateExperience = require('../../validation/experience');
const validateEducation = require('../../validation/education');

router.get('/test', (req, res) => {
    res.json({ test: 'Profile route work' })
})

// @@ GET api/profile/all
// @@ desc Get all users' profile
// @@ access Public
router.get('/all', (req, res)=>{
    const errors = {}
    Profile.find()
    .populate('user', ['name', 'avatar'])
        .then(profiles =>{
            if(!profiles){
                errors.profiles = 'No profiles found'
                return res.status(404).json(errors)
            }
            res.status(200).json(profiles)
        })
        .catch(err => res.status(404).json(err))
})

// @@ GET api/profile/handle
// @@ desc Get a profile by handle
// @@ access Public
router.get('/handle/:handle', (req, res)=>{
    const errors = {}
    Profile.findOne({handle: req.params.handle})
        .then(profile=>{
            if(!profile){
                errors.handle = 'No such handle found'
                return res.status(404).json(errors)
            }
            return res.status(200).json(profile);
        })
        .catch(err => res.status(404).json(err))
})

// @@ GET api/profile/user/id
// @@ desc Get a profile by id
// @@ access Public
router.get('/user/:user_id', (req, res)=>{
    const errors = {}
    Profile.findOne({user: req.params.user_id})
        .then(profile=>{
            if(!profile){
                errors.handle = 'No profile for that id'
                return res.status(404).json(errors)
            }
            return res.status(200).json(profile);
        })
        .catch(err => res.status(404).json({profile: 'No profile for that id'}))
})


// @@ GET api/profile
// @@ desc Get current user's profile
// @@ access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    let errors = {};
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
})

// @@ POST api/profile
// @@ desc CREATE/UPDATE profile info
// @@ access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid} = validateProfile(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    //Check for skills
    if (typeof req.body.skills !== undefined) {
        profileFields.skills = req.body.skills.split(',')
    }

    //Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                //Update
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
                    .then(profile => res.json(profile))
            } else {
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if (profile) {
                            errors.handle = 'Handle already exists'
                            res.status(400).send(errors)
                        } else {
                            new Profile(profileFields)
                                .save()
                                .then(profile => res.json(profile))
                        }
                    })
            }
        })
})

// @@ POST api/profile/experience
// @@ desc insert experince info
// @@ access Private
router.post('/experience',passport.authenticate('jwt', {session: false}), (req, res)=>{
    const {errors, isValid} = validateExperience(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    }
    Profile.findOne({user: req.user.id})
        .then(profile=>{
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                to: req.body.to,
                from: req.body.from,
                current: req.body.current,
                description: req.body.description
            }
            profile.experience.unshift(newExp);
            profile.save()
                .then(profile => res.status(200).json(profile))
        })
})

// @@ POST api/profile/education
// @@ desc insert education info
// @@ access Private
router.post('/education', passport.authenticate('jwt', {session: false}), (req, res)=>{
    const {errors, isValid} = validateEducation(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    }
    Profile.findOne({user: req.user.id})
        .then(profile=>{
            const newEd = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description,
            }
            profile.education.unshift(newEd);
            profile.save()
                .then(profile => res.status(200).json(profile))
        })
})

// @@ DELETE api/profile/experience/id
// @@ desc delete experince info
// @@ access Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({user: req.user.id})
        .then(profile=>{
            const removeIndex = profile.experience
                .map(exp => exp.id)
                .indexOf(req.params.exp_id);

            //Splice out of array
            profile.experience.splice(removeIndex, 1)
            //Save
            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.json(err))
})

// @@ DELETE api/profile/education/id
// @@ desc delete education info
// @@ access Private
router.delete('/education/:ed_id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({user: req.user.id})
        .then(profile=>{
            const removeIndex = profile.education
                .map(ed => ed.id)
                .indexOf(req.params.ed_id);

            //Splice out of array
            profile.education.splice(removeIndex, 1)
            //Save
            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.json(err))
})

// @@ DELETE api/profile/id
// @@ desc delete profile and user
// @@ access Private
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOneAndRemove({user: req.user.id})
        .then(() => {
            User.findOneAndRemove({id: req.user.id})
                .then(()=> res.json({success: true}))
        })
})

module.exports = router;
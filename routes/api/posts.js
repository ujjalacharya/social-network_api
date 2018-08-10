const router = require('express').Router();
const Post = require('../../models/Post');
const passport = require('passport');
const validatePostInput = require('../../validation/post')

router.get('/test', (req, res)=>{
    res.json({test: 'Posts route work'})
})

// @@ POST api/posts/register
// @@ desc Register POsts
// @@ access Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res)=>{

    const {errors, isValid} = validatePostInput(req.body);
    if(!isValid){
       return res.status(400).json(errors)
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then((post)=> {res.status(400).json(post)})
})

module.exports = router;
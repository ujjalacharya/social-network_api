const router = require('express').Router();
const Post = require('../../models/Post');
const User = require('../../models/User');
const passport = require('passport');
const validatePostInput = require('../../validation/post')

router.get('/test', (req, res)=>{
    res.json({test: 'Posts route work'})
})

// @@ GET api/posts/register
// @@ desc Get Posts
// @@ access Private
router.get('/', (req, res)=>{
    Post.find()
        .sort({date: -1})
        .then(posts =>{
            res.status(200).json(posts)
        })
        .catch(err => res.status(404))
})

// @@ GET api/posts/register
// @@ desc Get Posts
// @@ access Private
router.get('/:id',(req, res)=>{
    Post.findById(req.params.id)
        .then(post =>{
            res.status(200).json(post)
        })
        .catch(err => res.status(404).json({err: 'No such post found'}))
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

// @@ DELETE api/posts/:id
// @@ desc Delete Posts
// @@ access Private

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({user: req.user.id})
        .then(profile =>{
            Post.findById(req.params.id)
                .then(post => {
                    if(post.user.toString() !== req.user.id){
                        return res.status(401).json('Unauthorized')
                    }
                    post.remove()
                        .then(()=> res.json({success: true}))
                })

                .catch(err => res.status(404).json('No post found'))
        })
})

module.exports = router;

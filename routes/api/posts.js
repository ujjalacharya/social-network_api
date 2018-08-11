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

// @@ POST api/posts/likes/:id
// @@ desc POST LIkes to posts
// @@ access Private

router.post('/likes/:id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({id: req.user.id})
        .then(profile =>{
            Post.findById(req.params.id)
                .then(post =>{
                   if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                      return res.status(400).json({alreadyliked: 'User already likes this post'})
                   }
                   post.likes.unshift({user: req.user.id});
                   post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({notfound: 'No such post found'}))
        })
})

// @@ POST api/posts/unlike/:id
// @@ desc POST Unlike to posts
// @@ access Private

router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res)=>{
    Profile.findOne({id: req.user.id})
        .then(profile =>{
            Post.findById(req.params.id)
                .then(post =>{
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                        return res.status(404).json({notliked: 'User has not liked the post'})
                    }
                    const removeIndex = post.likes
                        .map(like => like.user.toString())
                        .indexOf(req.user.id);
                    post.likes.splice(removeIndex, 1);
                    post.save().then(post => res.json(post)) 
                })
        })
})

module.exports = router;

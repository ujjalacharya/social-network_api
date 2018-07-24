const router = require('express').Router();

router.get('/test', (req, res)=>{
    res.json({test: 'Posts route work'})
})

module.exports = router;
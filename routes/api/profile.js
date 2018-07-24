const router = require('express').Router();

router.get('/test', (req, res)=>{
    res.json({test: 'Profile route work'})
})

module.exports = router;
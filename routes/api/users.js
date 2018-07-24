const router = require('express').Router();

router.get('/test', (req, res)=>{
    res.json({test: 'Users route work'})
})

module.exports = router;
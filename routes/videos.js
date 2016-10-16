var express = require('express');
var router = express.Router();

router.get('/:ip', function(req, res, next) {
	res.render('video.html', {ip: req.params.ip});  
});

module.exports = router;
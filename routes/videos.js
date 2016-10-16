var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('video.html', {});  
});

module.exports = router;
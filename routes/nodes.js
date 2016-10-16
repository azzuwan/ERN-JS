var express = require('express');
var router = express.Router();
r = require('rethinkdb')

/* GET home page. */
router.get('/:id', function(req, res, next) {
	r.connect({host: 'localhost', port: 28015}, function(err,conn){
		if (err) throw err;
		r.db("ERN").table("nodes").get(req.params.id).run(conn, function(resErr, node){
			if (resErr) throw resErr;
			res.render('node.html', { node: node });
		});		
	});
  
});

module.exports = router;
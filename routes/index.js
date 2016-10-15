var express = require('express');
var router = express.Router();
r = require('rethinkdb')

/* GET home page. */
router.get('/', function(req, res, next) {
	r.connect({host: 'localhost', port: 28015}, function(err,conn){
		if (err) throw err;
		r.db("ERN").table("nodes").run(conn, function(resErr, cursor){
			if (resErr) throw resErr;
			console.log(cursor);
			cursor.toArray(function(curErr, nodes){
				res.render('index.html', { nodes: nodes });	
			})
			
		});		
	});
  
});

module.exports = router;

const express = require('express');
const app = express();
const simpleChain = require('simpleChainM');
const port = 8000;

const blockChain = new simpleChain.Blockchain();

app.get('/', function (req, res) {
	let blockHeight = blockChain.showBlockHeight();
	console.log(blockHeight);
	console.log(blockChain);
	res.write('Initial Block is:');
	res.write(JSON.stringify(blockChain));
	
	res.end();
});

app.get('/block/:id(\\d+)', function (req, res) {
	
	let inputId  = req.params.id;
	res.write('block #'+inputId+ '=');	
	blockChain.getBlock(inputId).then(function(block){
		res.write(JSON.parse(JSON.stringify(block)));
		res.end();
	});
	
	
});

app.get('/block', function (req, res) {
	
	res.write('last block = ');	
	res.end();

});


app.listen(port, () => console.log('Example app listening on port '+ port + '!'));

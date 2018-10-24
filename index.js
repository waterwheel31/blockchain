const express = require('express');
const app = express();
const simpleChain = require('./simpleChainM3');
const port = 8000;

const blockChain = new simpleChain.Blockchain();

app.listen(port, () => console.log('Example app listening on port '+ port + '!'));

app.get('/', function (req, res) {
	res.json('to see a block, please send a GET message to /block/(num)');
	res.end();
});

app.get('/block/:id(\\d+)', function (req, res) {
	
	let inputId  = req.params.id;
	
	blockChain.getBlock(inputId).then(function(block){
		res.json(JSON.parse(block));
		res.end();
	}).catch(function(e){
		res.json('that block cannot be found!');
	});
	

	
});

/*
app.get('/block/', function (req, res) {
	let blockMessage = req.query.mes;
	res.write('mes = ' +blockMessage);	
	res.end();
});
*/

app.post('/block/:mes', function (req, res) {
	let blockMessage = req.params.mes;
	if(blockMessage != null){
		console.log('type of block message < ' + blockMessage+ ' > is '+ typeof blockMessage);
		
		block = new simpleChain.Block(blockMessage);
		blockChain.addBlock(block);
		console.log(block);
		res.json(block);	
		res.end();
		
		
	}
	
});

app.get('/block/:text(\\w+)', function (req, res) {
	
	let inputId  = req.params.text;
	res.write('strings');	
});

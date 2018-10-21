const express = require('express');
const app = express();
const simpleChain = require('simpleChainM');
const port = 8000;

const blockChain = new simpleChain.Blockchain();
console.log('new blockChain created');



app.listen(port, () => console.log('Example app listening on port '+ port + '!'));


app.get('/', function (req, res) {
	let blockHeight = blockChain.showBlockHeight();
	console.log('block height:'+blockHeight);
	console.log(blockChain);
	res.write('Initial Block is:');
	res.write(JSON.stringify(blockChain));
	
	res.end();
});

app.get('/block/:id(\\d+)', function (req, res) {
	
	let inputId  = req.params.id;
	//res.write('block #'+inputId+ '=');	
	blockChain.getBlock(inputId).then(function(block){
		res.json(JSON.parse(JSON.stringify(block)));
		res.end();
	});
	

	
});

app.get('/block/', function (req, res) {
	let blockMessage = req.query.mes;
	if(blockMessage != null){
		console.log('type of ' + blockMessage+ ' is '+ typeof blockMessage);
		block = new simpleChain.Block(blockMessage);
		blockChain.addBlock(block);
		res.write('mes = ' +blockMessage);	
		res.end();
	}
	
});

app.get('/block/:text(\\w+)', function (req, res) {
	
	let inputId  = req.params.text;
	res.write('strings');	
});

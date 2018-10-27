const express = require('express');
const app = express();
const simpleChain = require('./simpleChainM3');
const bodyParser = require('body-parser');
const port = 8000;


console.log('application started!');
const blockChain = new simpleChain.Blockchain();

app.listen(port, () => console.log('Example app listening on port '+ port + '!'));



app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.text());


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

app.post('/block/', function (req, res) {
	let blockMessage = req.body;
	
	if(blockMessage != null){
		console.log('type of block message < ' + blockMessage+ ' > is '+ typeof blockMessage);
		
		console.log('before Block(blockMessage)');
		block = new simpleChain.Block(blockMessage);
		console.log('after Block(blockMessage)');
		blockChain.addBlock(block);

		console.log(blockChain);
		res.json(block);	
		res.end();
		
		
	}
	
});

app.get('/block/:text(\\w+)', function (req, res) {
	
	let inputId  = req.params.text;
	res.write('strings');	
});

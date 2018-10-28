const express = require('express');
const app = express();
const simpleChain = require('./simpleChainM3');
const bodyParser = require('body-parser');
const bitcoinMessage = require('bitcoinjs-message');
const port = 8000;
const validateWindowSec = 300;

var requests = {};

console.log('application started!');
const blockChain = new simpleChain.Blockchain();

app.listen(port, () => console.log('blockchain app listening on port '+ port + '!'));



app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.text());
app.use(bodyParser.json());


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
		res.end();
	});
	

	
});



app.post('/block/', function (req, res) {
	let blockMessage = req.body;
	
	if(blockMessage != null){
		
		console.log('before Block(blockMessage)');
		block = new simpleChain.Block(blockMessage);
		console.log('after Block(blockMessage)');
		blockChain.addBlock(block).then(function(newBlock){
			res.json(newBlock);	
			console.log('newBlock=',newBlock);
			res.end();

		});
		

	
	}
	
});

app.post('/block2/', function (req, res) {
	let blockMessage = req.body;

	if(blockMessage != null){
		
		console.log('before Block(blockMessage)');
		block = new simpleChain.Block(blockMessage);
		console.log('after Block(blockMessage)');
		blockChain.addBlock(block).then(function(newBlock){

			res.json(newBlock);	
			res.end();

		}).catch(function(e){
		res.json('an error occured');
		res.end();
		});
	
	}
	
});



app.get('/block/:text(\\w+)', function (req, res) {
	
	let inputId  = req.params.text;
	res.write('strings');	
});


app.post('/requestValidation/', function(req,res){
	
	var isExists = 0; 

	var responseString ={};
	var body = req.body;
	var address = body['address'];
	var timestamp = new Date().getTime().toString().slice(0,-3);
	var message = address + ':' + timestamp + ':starResistry';

	// Checking existance of the address to avoid duplication, and removing expired items
	for (key in requests){
		console.log('key= ',key, ' timestamp =',requests[key]);
		if (key == address) {isExists = 1; }
		if (timestamp - requests[address] > validateWindowSec){
			delete requests[key];
			console.log('deleting ',key, ' due to overtime.');
		}
	}

	if (isExists == 1){
		res.write('this address is already registered.');
		res.end();

	}else{
		responseString.address = address;
		responseString.requestTimeStamp = timestamp;
		responseString.message= message;

		// adding address to waiting list 
		requests[address] = timestamp;
		res.json(responseString);
		res.end();
	}

});



app.post('/message-signature/validate/',function(req,res){

	var responseString ={};
	var body = req.body;
	var address = body['address'];
	var signiture = body['signature'];
	var timeNow = new Date().getTime().toString().slice(0,-3);

	if (requests[address] == null ){
		res.write('your address request is already expired. Please request again.');
		res.end();
	}else{
		var timestamp = requests[address];
		var message = address + ':' + timestamp + ':starResistry';
		responseString.address = address;
		responseString.requestTimeStamp = timestamp;
		responseString.message= message;
		responseString.validationWindow= validateWindowSec - (timeNow - timestamp);
		
		var signitureValid = 'non-valid';
		if (bitcoinMessage.verify(message,address,signiture)){
			signitureValid='valid';
			blockChain.addAddress(address,signitureValid);
			}

		responseString.messageSignature= signitureValid;

		res.json(responseString);

		res.end();
	}

})

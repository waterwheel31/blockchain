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

	let requestTimeStamp ="";

	console.log('checkpoint');

	// Checking existance of the address to avoid duplication, and removing expired items
	/*
	for (key in requests){
		console.log('key= ',key, ' timestamp =',requests[key]);
		if (key == address) {
			isExists = 1; 
			requestTimeStamp = requests[key];
		}
		if (timestamp - requests[address] > validateWindowSec){
			delete requests[key];
			console.log('deleting ',key, ' due to overtime.');
		}
	}
	*/

	blockChain.getWaitingAddress(address).then(function(waitTS){

		if (timestamp - waitTS > validateWindowSec){
			res.write('deleting ',key, ' due to overtime.');
			delWaitingAddress(address);
			res.end();
		}
		
		else {

			responseString.address = address;
			responseString.requestTimeStamp = waitTS;
			responseString.message= message;
			responseString.validationWindow = validateWindowSec - (timestamp-waitTS);

			res.json(responseString);
			res.end();


		}

		



	}).catch(function(e){

		responseString.address = address;
		responseString.requestTimeStamp = timestamp;
		responseString.message= message;
		responseString.validationWindow = validateWindowSec;

		// adding address to waiting list 
		
		blockChain.addWaitingAddress(address,timestamp);

		res.json(responseString);
		res.end();


	});



});



app.post('/message-signature/validate/',function(req,res){

	var responseString ={};
	var body = req.body;
	var address = body['address'];
	var signiture = body['signature'];
	var timeNow = new Date().getTime().toString().slice(0,-3);

	blockChain.getWaitingAddress(address).then(function(waitTS){

		var timestamp = waitTS;
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


	}).catch(function(e){
		res.write('your address request is already expired or not exist. Please request again.');
		res.end();

	});


});

app.post('/block2/', function (req, res) {

	// ++++ Receiving the body data	
	var body = req.body;

	// ++++ Checking for address validity

	blockChain.validateAddress(body['address']).then(function(validation){
		console.log('address validation=',validation);

		if (validation =='valid' || validation>=0){

			
			// ++++ Creating new block to be added
			var newBlockBody = {};
			newBlockBody.address = body['address']; 
			newBlockBody.star = {};
			newBlockBody.star.dec   = body['star']['dec'];
			newBlockBody.star.ra    = body['star']['ra'];
			newBlockBody.star.mag 	= body['star']['mag'];
			newBlockBody.star.con 	= body['star']['con'];

			var buf = Buffer.from(body['star']['story'],'ascii');
			newBlockBody.star.story = buf.toString('hex');


			// Checking the input 
			if (newBlockBody.star.dec==""){
				res.write('please fill dec');
				res.end();
			}
			if (newBlockBody.star.ra==""){
				res.write('please fill ra');
				res.end();
			}
			if (newBlockBody.star.story.bytes>500){
				res.write('maximum length of story is 500 bytes');
				res.end();
			}



			let newBlock = new simpleChain.Block(newBlockBody);


			// ++++ Adding the block and HTTP response
			
			blockChain.addBlock(newBlock).then(function(addedBlock){
				
				// adding blockheight for each address 
				console.log('height for address is:',addedBlock['height']);
				blockChain.addHeightForAddress(body['address'],addedBlock['height']);

				res.json(addedBlock);
				res.end();
			}).catch(function(e){
				res.json('an error occured!');
				res.end();
			});

		}
	}).catch(function(e){
				console.log(e);
				res.json('the address is not valid');
				res.end();
	});

});


app.get('/stars/address/:ADDRESS', function (req, res) {
	
	blockChain.validateAddress(req.params.ADDRESS).then(function(height){
		console.log('height=',height);
		return blockChain.getBlock(height);	
	}).then(function(block){

		var parsedBlock = JSON.parse(block);
		var encodedStory = Buffer.from(parsedBlock.body.star.story,'hex');
		
		parsedBlock.body.star.storyDecoded = encodedStory.toString('ascii');
		
		res.json(parsedBlock);
		res.end();

	}).catch(function(e){
		res.json('some error has occured');
		res.end();
	});

});


app.get('/stars/hash/:HASH', function (req, res) {
	
	let hash = req.params.HASH; 

	blockChain.getBlockHeight().then(function(height){
	
		for (let i=0; i<=height;i++){
			blockChain.getBlock(i).then(function(block){
				let parsedBlock = JSON.parse(block);
				//console.log('height:',i,' hash=',parsedBlock.hash, hash);
				if (parsedBlock.hash == hash){
					console.log('hash is matched at:',i);
					res.json(parsedBlock);
					return; 
				}
	
			}).catch(function(e){
				console.log(e);
				return e;
			});
		}

	}).then(function(){
		console.log('checkpoint2');
	}).catch(function(e){
		console.log('checkpoint3');
		console.log(e);
		//res.write(e);
		res.end();
	});


});
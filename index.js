const express = require('express');
const app = express();
const simpleChain = require('./simpleChainM3');
const bodyParser = require('body-parser');
const bitcoinMessage = require('bitcoinjs-message');

const port = 8000;
const validateWindowSec = 300;

var requests = {};


// Starting Messages 
console.log('application started!');
const blockChain = new simpleChain.Blockchain();
app.listen(port, () => console.log('blockchain app listening on port '+ port + '!'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.text());
app.use(bodyParser.json());


// GET message for no parameters
app.get('/', function (req, res) {
	res.json('to see a block, please send a GET message to /block/(num)');
	res.end();
});


// GET and POST  meessage with /block 
app.get('/block/:id(\\d+)', function (req, res) {
	
	let inputId  = req.params.id;
	
	blockChain.getBlock(inputId).then(function(block){
		console.log('getBlock!');

		block = JSON.parse(block);

		var encodedStory = Buffer.from(block.body.star.story,'hex');
		block.body.star.storyDecoded = encodedStory.toString('ascii');
		console.log('block:',block);

		res.json(block);
		res.end();
	}).catch(function(e){
		console.log(e);
		res.json('that block cannot be found!');
		res.end();
	});
	
});

app.get('/block/:text(\\w+)', function (req, res) {
	
	let inputId  = req.params.text;
	res.write('strings');	
});



/* app.post('/block/', function (req, res) {
	let blockMessage = JSON.parse(req.body);

	console.log('blockMessage', blockMessage);
	console.log('blockMessage length', blockMessage.length);
	console.log('body', blockMessage.star.dec);

	var dec    = blockMessage.star.dec;
	var ra     = blockMessage.star.ra;
	var story  = blockMessage.star.story;

	if (dec == null || ra== null) {
		res.json('please write both dec and re!');
		res.end();
	}

	max_length = 250; 

	if (story.length > max_length) {
		res.json('maximum length of story is 250!');
		res.end();
	}
	
	if(blockMessage != null ){
		
		console.log('before Block(blockMessage)');
		block = new simpleChain.Block(blockMessage);
		console.log('after Block(blockMessage)');
		blockChain.addBlock(block).then(function(newBlock){
			res.json(newBlock);	
			console.log('newBlock=',newBlock);
			res.end();

		});		
	} else{
		res.json('body is null!');
		res.end();
	}
	
});
*/

// Post message with /requestValidation/ 

app.post('/requestValidation/', function(req,res){
	
	var isExists = 0; 

	var responseString ={};
	var body = JSON.parse(req.body);  // 
	var address = body['address'];
	var timestamp = new Date().getTime().toString().slice(0,-3);

	let requestTimeStamp ="";

	console.log('checkpoint');
	//console.log('body:',body); 
	//console.log('address:',address); 
	//console.log('timestamp:',timestamp); 

	blockChain.getWaitingAddress(address).then(function(waitTS){

		console.log('address:',address); 
		console.log('timestamp:',timestamp); 

		var message = address + ':' + waitTS + ':starResistry';

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

		console.log('request Validation, catched error with getWaitingAddress');

		responseString.address = address;
		responseString.requestTimeStamp = timestamp;
	
		console.log('address:',address); 
		console.log('timestamp:',timestamp); 

		// adding address to waiting list 
		
		blockChain.addWaitingAddress(address,timestamp);
		res.end();

	}).catch(function(e){

		console.log('request Validation, catched error with getWaitingAddress 2nd');
		console.log(e);
		res.json(responseString);
		res.end();
	});

});



// Post message - signiture validation 

app.post('/message-signature/validate/',function(req,res){

	var responseString ={};
	var body = JSON.parse(req.body);
	var address = body['address'];
	var signiture = body['signature'];
	var timeNow = new Date().getTime().toString().slice(0,-3);


	blockChain.getWaitingAddress(address).then(function(waitTS){

		var timestamp = waitTS;

		console.log('timeNow:',timeNow);
		console.log('timestamp:',timestamp);

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
		console.log(e);
		res.write('an error occured.');
		res.end();

	});
});


// Post 

app.post('/block/', function (req, res) {

	// ++++ Receiving the body data	
	var body = JSON.parse(req.body);

	console.log('address:',body['address']);

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


// Get message with star address 

app.get('/stars/address:ADDRESS', function (req, res) {
	
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


// Get message with star hash

app.get('/stars/hash:HASH', function (req, res) {
	
	let hash = req.params.HASH; 

	console.log('hash:',hash);

	blockChain.getBlockHeight().then(function(height){
	
		for (let i=0; i<=height;i++){
			blockChain.getBlock(i).then(function(block){
				let parsedBlock = JSON.parse(block);
				//console.log('height:',i,' hash=',parsedBlock.hash, hash);
				console.log('parsedBlock hash:',parsedBlock.hash, parsedBlock.hash==hash);
				console.log('registBlock hash:',hash);
				if (parsedBlock.hash == hash){
					console.log('hash is matched at:',i);
					console.log(parsedBlock);
					//res.json(parsedBlock);
					//return; 
					var buf = Buffer.from(parsedBlock.body.star.story, 'hex');
					console.log('buf:',buf);

					var unhashed = buf.toString('ascii');
					console.log('unhashed:',unhashed);

					parsedBlock.body.star.story = unhashed;

					res.json(parsedBlock);
					res.end();
					
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
const express = require('express')
const app = express()
const simpleChain = require('simpleChainM');

const blockChain = new simpleChain.Blockchain();

app.get('/', function (req, res) {
	res.send('hello world!'); 

	let blockHeight = blockChain.showBlockHeight();
	res.send(blockHeight);
});

app.listen(8000, () => console.log('Example app listening on port 8000!'));

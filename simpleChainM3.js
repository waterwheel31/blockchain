/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/


class Blockchain{
  constructor(){
  

    // confirm the blockchain height 
    
    this.getBlockHeight().then(function(height){

        console.log('block height = ',height);

        if (height == null){
        // set the height of the blockchain to be 0 - initiallizing

            this.chain = [];
            let that = this;

            // initialize block height 
            var init = new Promise (function(resolve, reject){
              db.put('height',0,function(err){
              if (err) return console.log('height error'+ err);
              resolve();
              });
            }).then(function(){
              // create genesis block 
              let geneBlock = new Block("First block in the chain - Genesis block");
              console.log('initial block = '+JSON.stringify(geneBlock));
              geneBlock.height = 0;

              // add genesis block onto the blockchain
             that.addBlock(geneBlock);

            });
        } 
    });


  }

  // Add new block
  addBlock(newBlock){

    // Preparing settings of new block
    let that = this;
    let blockchainHeight = 0;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);

    this.getBlockHeight().then(function(height){

      console.log('step2, height= '+height);

      let block = "";

      blockchainHeight = Number(height);
      console.log('blockchainHeight:',blockchainHeight);
      block = that.getBlock(height);
      
      return block;

    }).then(function(block){

      let parsedBlock = JSON.parse(block);
         
      console.log(block);
      console.log ('newBlock height=', newBlock.height, ' blockchain height =', blockchainHeight);
      newBlock.height = blockchainHeight;
      
      if (newBlock.height>0){ 
          newBlock.previousBlockHash = parsedBlock.hash;
          console.log('previous hash = ',parsedBlock.hash);
      }

      // Block hash with SHA256 using newBlock and converting to a string
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();


      // Adding block object to chain
      db.put(newBlock.height,JSON.stringify(newBlock).toString(),function(err){
        if (err) return console.log('constructor error'+ err);
      });

      return parsedBlock;

    }).then(function(block){

      // Block height update
      db.put('height',blockchainHeight+1,function(err){
        if (err) return console.log('constructor error'+ err);
      });
    });

    this.chain.push(newBlock);

  }


  // Get block height
    getBlockHeight(){

      let dbKey = 'height';  
      return new Promise(function(resolve, reject){
        db.get(dbKey, function(err,value){
            if (err) return console.log('not found!',err);
            resolve(value);
        });
      });  
    }

    showBlockHeight(){
      this.getBlockHeight().then(function(height){
        //console.log('block height= '+ height);
        return height;
      });
    }


    // get block
    getBlock(blockHeight){

      return new Promise(function(resolve, reject){
        db.get(blockHeight, function(err,value){
            if (err) return reject(err);
            
            resolve(value);
        });
      });
    }

    // NOT WORKING WELL. I see only PROMISE output
    showBlock(blockHeight){
      this.getBlock(blockHeight).then(function(block){
        console.log('block number '+ blockHeight + ':' + JSON.parse(JSON.stringify(block)));
      });
    }



    // validate block
    validateBlock(blockHeight){
      // get block object

      let unparsedBlock = "";
      let parsedBlock = "";

      this.getBlock(blockHeight).then(function(block){

        unparsedBlock = block;
        parsedBlock = JSON.parse(unparsedBlock);
        
    
        let blockHash = parsedBlock.hash;
        // generate block hash
        parsedBlock.hash = "";
        //console.log(JSON.stringify(parsedBlock));

        let validBlockHash = SHA256(JSON.stringify(parsedBlock)).toString();
        //console.log('valid Block Hash = '+validBlockHash);

        // Compare
        if (blockHash===validBlockHash) {
            console.log('block #'+blockHeight+ ' is valid.');
            return true;
            
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }

      });

    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      let chainLength = this.getBlockHeight();
      for (var i = 0; i < chainLength-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        //let blockHash = this.chain[i].hash;
        //let previousHash = this.chain[i+1].previousBlockHash;
        //if (blockHash!==previousHash) {
        //  errorLog.push(i);
        
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }


}

module.exports = {
   Block: Block,
   Blockchain: Blockchain
};




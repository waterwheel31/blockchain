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
  
    let that = this;

    // confirm the blockchain height 
    
    this.getBlockHeight().then(function(height){

        console.log('blockchain already exsits. block height = ',height);

    }, function(error){
      
        console.log('initializing blockchain');

        // initialize block height 
        var init = new Promise (function(resolve, reject){
          db.put('height',-1,function(err){
          if (err) return console.log('height error'+ err);
          resolve();
          });
        }).then(function(){
          // create genesis block 
          let geneBlock = new Block("First block in the chain - Genesis block");
          console.log('initial block = ');
          console.log(JSON.parse(JSON.stringify(geneBlock)));
          
          geneBlock.height = 0;
          console.log('geneBlock.height=',geneBlock.height);
          //console.log('that=',that);

          // add genesis block onto the blockchain
          that.addBlock(geneBlock);
          //console.log('end of constructor');

        });
    });


  }

  // Add new block
  addBlock(newBlock){

    // Preparing settings of new block
    let that = this;
    let blockchainHeight = 0;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);

      console.log('addBlock step 1');

      this.getBlockHeight().then(function(height){

      console.log('addBlock step 2, height= '+height);

      blockchainHeight = Number(height);
      console.log('blockchainHeight:',blockchainHeight);
      
      let block;

      if(blockchainHeight==-1){
        return block;
      }else{
        block = that.getBlock(height);
        return block;
      }

    }).then(function(block){

      console.log('addBlock step 3');
         
      console.log ('newBlock height=', newBlock.height, ' blockchain height =', blockchainHeight);
      newBlock.height = blockchainHeight+1;
      
      // Adding previous block hash
      if (newBlock.height>0){ 
          let parsedBlock = JSON.parse(block);
          newBlock.previousBlockHash = parsedBlock.hash;
      }

      // Adding current block hash with SHA256 using newBlock and converting to a string
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();


      // Adding the block object to blockchain
      db.put(newBlock.height,JSON.stringify(newBlock).toString(),function(err){
        if (err) return console.log('constructor error'+ err);
      });

      
    }).then(function(){

      // Block height update

      console.log('addBlock step 4, BCheight=', blockchainHeight);
      db.put('height',blockchainHeight+1,function(err){
        if (err) return console.log('constructor error'+ err);
      });
    });


    //this.chain.push(newBlock);

  }


  // Get block height
    getBlockHeight(){

      let dbKey = 'height';  
      return new Promise(function(resolve, reject){
        db.get(dbKey, function(err,value){
            if (err) {
              reject(err);
            }
            else resolve(value);
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




# Blockchain excercise on node.js 

Using this repository, you can create a blockchain, and add data on it

## Functions

This program has 3 functions as below

* Creating blockchain
* Adding a data on blockchain
* Checking a data on specific block 


## How to start 

Before starting, you need to install following libraries
* node.js
* Express.js 
* Level DB
* SHA256 

To run this program, you need to download or clone this repository, and run index.js on node.js as below

```
>node index.js 
```

## Creating blockchain 

launch a browser, go to `localhost:8000` by writing the address on URL bar of the browser. 

Then a block chain will be set up 


## Adding a data on blockchain 

By writing an address on the URL bar of the browser, you can add a data on the lastest block on the blockchain

`localhost:8000/block/?mes= XXXXX` 

Please replace XXXXX above by the string data that you would like to add


## Checking data on specific block 

By writing an address on the URL bar of the browser, you can get a data on a specific block on the blockchain

`localhost:8000/block/2`

Please replace "2" above by the blocknumber of the block you would like to see

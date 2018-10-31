# Star Notary Service 

## Functions

This program has 3 functinos as blow: 

* Requesting validation of bitcoin address 
* Validating by signiture
* Registering a star information
* Looking up the star information

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





## Requesting validation of bitcoin address 

Send POST message to 

/requestValidation/

with body as below

{"address":"<YOUR BITCOIN WALLET ADDRESS>""}

Then you will get a JSON message as below 

{
    "address": "14YgtAvpFppvoMbmxqbq2bAJG3sSp8oScB",
    "requestTimeStamp": "1540727090",
    "message": "14YgtAvpFppvoMbmxqbq2bAJG3sSp8oScB:1540727090:starResistry"
}

Please copy the "message" part and create a signiture for this message and your address. 

Then go to next part

## Validating by signiture

Send POST message to

/message-signature/validate/

with body as below: 

{"address":<YOUR BITCOIN WALLET ADDRESS>, "signature":"<YOUR SIGNATURE CREATED BY WALLET>""}

The signature will be expired after 5 minutes of generation. In that case, please request validation again. 

If your signiture is valid, Then you will get a JSON message as below

{
    "address": "14YgtAvpFppvoMbmxqbq2bAJG3sSp8oScB",
    "requestTimeStamp": "1540727090",
    "message": "14YgtAvpFppvoMbmxqbq2bAJG3sSp8oScB:1540727090:starResistry",
    "validationWindow": 80,
    "messageSignature": "valid"
}



## Registering a star information

Send POST to 

/block2/

with body as below: 

{"address": "14YgtAvpFppvoMbmxqbq2bAJG3sSp8oScB", 
	 "star":{
		"dec":"d",
		"ra":"r",
		"mag":"m", 
		"con":"c",
		"story":"story"
	}
}


Here, each parameter means as below:

dec = declination
ra =  right_ascension
mag = magnitude [optional]
con = constellation [optional]
story = star story [limited to 250 words/500 bytes]


This will register the information of your star on the blockchain. 



## Looking up the star information

Send GET to 

/stars/address/<YOUR WALLET ADDRESS>

or 

/stars/hash/<BLOCK HASH>



Then you can see registered informaiton on the blockchain. The output will be as below: 

{
    "hash": "ccc3f1fb154b5e34a5f95043b436e3211ae24156ca42b9448354ef7caba303fa",
    "height": 38,
    "body": {
        "address": "14YgtAvpFppvoMbmxqbq2bAJG3sSp8oScB",
        "star": {
            "dec": "d",
            "ra": "r",
            "mag": "m",
            "con": "c",
            "story": "story"
        }
    },
    "time": "1540726330",
    "previousBlockHash": "ba520ae228f91844478d087b4daa228f9fa3ab9cabed7921fd8c7db5e44f34c9"
}









---------------------------------------------------------

#FOLLOWINGS ARE FOR PREVIOUS PROJECT

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

By writing following comand with POST verb, you can add a data on the lastest block on the blockchain

`localhost:8000/block/` 

You can send TEXT message from above. 

Be careful not to send in JSON messages. 
For example, if the body text is "abc", please send like:
"abc",

not like
{"body":"abc"}


There are several ways to post a POST command. One way is using Postman (https://www.getpostman.com/).


## Checking data on specific block 

By writing an address on the URL bar of the browser, you can get a data on a specific block on the blockchain

`localhost:8000/block/2`

Please replace "2" above by the blocknumber of the block you would like to see

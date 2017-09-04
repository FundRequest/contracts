# Fundrequest Private Presale

This repository contains the code for the private presale, where we will guarantee a select few the ability to be in the presale.

## Prerequisites
* Have a Geth client or a TestRPC running, default the contract will be deployed to localhost:8545
* Truffle version 3.4.9 (solidity 0.4.15) is used 
* node v6.11.2 (npm version 3.10.10) is used
* Have an access token for infura (https://infura.io) and put the token in `./config/secrets/infura-token.js`

## First Time
Run (in root folder of repo)
```
npm install
```
to get all required node_modules.

## Usage

To build and run the code run the following commands inside the cloned repo.

* compile contracts (do everytime a contract changes) to `./build/contracts`
```
truffle compile
```
* add contracts to local TestRPC (do everytime a new TestRPC is set up or when contracts changed)
```
truffle migrate
```
* build the website in the `./build` folder
```
gulp build
```
* run app (on http://localhost:8080)

```
http-server ./build
```

## Distribution

To build the app to the `./dist` folder:
```
gulp dist
```


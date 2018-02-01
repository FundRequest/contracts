### FundRequest Contracts<img align="right" src="https://fundrequest.io/assets/img/logo.png" height="30px" />

[![Build Status](https://travis-ci.org/FundRequest/contracts.svg?branch=master)](https://travis-ci.org/FundRequest/contracts)

Contracts for FundRequest (token, crowdsale and platform contracts)


### Development [![Build Status](https://travis-ci.org/FundRequest/contracts.svg?branch=develop)](https://travis-ci.org/FundRequest/contracts)

**Using the Facuet**

Send a transaction of 0 wei to 0x9db4361d44c5311291a12eddd1f3ea58c12951b8. This will give you 1 FND token to work with. 


---

**Latest Migration**


```
Running migration: 1_migrations.js
  Deploying Migrations...
  ... 0x60a379c0e271749b1551f731464efb0bec43731fc13b44777f0f2659054cd6be
  Migrations: 0x8839eefa708ee4cd818c945764f8a7ff7e048ec0
Saving successful migration to network...
  ... 0xb4ff301d1d0e54f991f851dfe6649cbee4070cb2a83439fed7bb92ddc7471ba7
Saving artifacts...
Running migration: 2_deploy_token_contract.js
  Deploying FundRequestToken...
  ... 0xf74ad60f212ac2f7922dd117b6311512e2b356629f452d5cd0677b64a598260d
  FundRequestToken: 0x5a481b10a0138e0db94126e9b6ca2188a18cb21c
Saving successful migration to network...
  ... 0x916ca189147d068881b65314bafb31cbc69734c80b1d7a5c5053d16fe724d857
Saving artifacts...
Running migration: 3_deploy_fundrequest_contract.js
  Deploying SafeMath...
  ... 0x4064c014c069b8902b144e65bc594c781d44935ab77544a8a152dbabcafe03f7
  SafeMath: 0x1e8b805e7e5011e2619c9c778ff7c11c1ea9fcac
  Deploying strings...
  ... 0x995ac1fd4e1f4d2c11aba77a71b332107f55647a84a4b64d0cf26b7e290bb347
  strings: 0xfc7babfd5db67a0e67b57779a515b534aaa9b17c
  Deploying FundRepository...
  ... 0x348e4ad8c2c82e73f0d524260c9948024535f8ac95f48363765941e88f281a0b
  FundRepository: 0x75a14d8896b4d1f931908be3eaa7acf73c0aa4fd
  Deploying ClaimRepository...
  ... 0x1b774e6667bda55a8846e480321fae8e874d18777e517b56595b785ec8ea3ba7
  ClaimRepository: 0x6e6dd9a60a15823d50808c509ec264f7ddb8a4f0
The address: 0x75a14d8896b4d1f931908be3eaa7acf73c0aa4fd
  Deploying FundRequestContract...
  ... 0x16e416da86a7863df9b3a7ee233da0242be46fbcb82b3c7e516ba2e21705a44d
  FundRequestContract: 0x0a0d468e58a8ddb2817635fe4bef039046de8a14
Saving successful migration to network...
  ... 0xf37c213556d5bf0dbd32b65e78e9ccac153d67191cbe738a8eac44a36318e26b
Saving artifacts...

Running migration: 5_TGE.js
  Deploying FundRequestTokenGeneration...
  ... 0x2a0205f5ff9969f130f8e28eb125c190760ef2e884c6a556f60021552ba84763
  FundRequestTokenGeneration: 0x0bbea94248c944929b35ed3d8fbe0ffbeb21ba07
Saving successful migration to network...
  ... 0x0ab2fde4aa9f19a1d853570a4d4fc6d28c066a00c5652ad911d91e12aa04ab0a
Saving artifacts...

```

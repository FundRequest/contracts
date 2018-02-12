### FundRequest Contracts<img align="right" src="https://fundrequest.io/assets/img/logo.png" height="30px" />

[![Build Status](https://travis-ci.org/FundRequest/contracts.svg?branch=master)](https://travis-ci.org/FundRequest/contracts)

Contracts for FundRequest (token, crowdsale and platform contracts)


### Development [![Build Status](https://travis-ci.org/FundRequest/contracts.svg?branch=develop)](https://travis-ci.org/FundRequest/contracts)


### Migrations

#### Mainnet

```
Using network 'main'.

Running migration: 1_migrations.js
  Deploying Migrations...
  ... 0x13909c1ad07d1e9015b9ad09f67b64a6511618a7be0c613ea1434065aac65b16
  Migrations: 0xa74241f33518390bb490f3f8bdee50037405e859
Saving successful migration to network...
  ... 0x76ec17736348ad975f537604d26ed5df8b4c932cd24f8753df2c93a1cfc68324
Saving artifacts...
Running migration: 2_deploy_token_contract.js
  Deploying MiniMeTokenFactory...
  ... 0x703aad2c1f996daa589db79723742975e0abd33745f9fe3ae4e67e6e28faada9
  MiniMeTokenFactory: 0x8b0b13d43122eaba2b2318387dc6a368ce398f6a
  Deploying FundRequestToken...
  ... 0x6b2b067e4325a34afb2f51178b6d2a2a90277babd39d85de17baa4e70d3e7c77
  FundRequestToken: 0x4df47b4969b2911c966506e3592c41389493953b
Saving successful migration to network...
  ... 0xc3a3d4de5b0d9dc28431dacb7a422f5cd7e6f46499c44b110bb286f2ba926199
Saving artifacts...
Running migration: 3_TGE.js
  Deploying FundRequestTokenGeneration...
  ... 0xbf8296b277c9eddb5a5ae80b112450c5e2340ddc3936f05b8f9d838a1d2ba4ea
  FundRequestTokenGeneration: 0xbcc546eb5a290977180f85cafaa712019893729c
Saving successful migration to network...
  ... 0xeb62da5dc986fc36bf48df6a24351924675e4a09281c6b0c9ba78720a5ccc60b
Saving artifacts...
```
---

#### Ropsten

``
Running migration: 1_migrations.js
  Deploying Migrations...
  ... 0x05a125cf68f2baaf257f4721dbd1702028afb303bf0c9c3bd31198bb5fc4c83b
  Migrations: 0x8e1c1a20fca9c90f3a3e6343f98ba0d533642d0a
Saving successful migration to network...
  ... 0x1189a58a2b7d88dd4d5cc0b53e8e7a6cbd482b7a9ea4b8fb18268a21a783adc6
Saving artifacts...
Running migration: 2_deploy_token_contract.js
  Deploying MiniMeTokenFactory...
  ... 0xc4fe3b38e385979ba0ae88684c2fb33f2b57b3731d1aed4b209b9ecbfa1f8143
  MiniMeTokenFactory: 0xc914fe508884b91f4ca12c80ca7d00a671c73a4e
  Deploying FundRequestToken...
  ... 0x446ac5bdc705c3d614e881a04090ae401acef4af04feeac07f90c889491f331d
  FundRequestToken: 0xde2674ca755fb89fba3e82b6822d658ff67a9c75
Saving successful migration to network...
  ... 0x5a41beca2ce5d92a4aa5338991019ab3196b356555eab30d21f9f59eaab09bf4
Saving artifacts...
Running migration: 3_TGE.js
  Deploying FundRequestTokenGeneration...
  ... 0xdf9daedf229d46db468cd015cfaff0cc9173d369222c7e1bfe4ccc130384bb03
  FundRequestTokenGeneration: 0x93040a4f0fff7f975615ad69592631d207406d84
Saving successful migration to network...
  ... 0x31bf72bb47708086c90f6cbbb939c34f1c4dc3074fa1b144a024a6c826adb24a
Saving artifacts...
``
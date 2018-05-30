### FundRequest Contracts<img align="right" src="https://fundrequest.io/assets/img/logo.png" height="30px" />

[![Build Status](https://img.shields.io/travis/FundRequest/contracts.svg?style=for-the-badge)](https://img.shields.io/travis/FundRequest/contracts.svg?style=for-the-badge) 
[![Greenkeeper badge](https://badges.greenkeeper.io/FundRequest/contracts.svg)](https://greenkeeper.io/)

Contracts for FundRequest (token, crowdsale and platform contracts)


#### Mainnet

| First Header  | Second Header |
| ------------- | ------------- |
| MiniMeTokenFactory  | 0x8b0b13d43122eaba2b2318387dc6a368ce398f6a  |
| FundRequestToken  | 0x4df47b4969b2911c966506e3592c41389493953b  |
| FundRequestTokenGeneration  | 0xbcc546eb5a290977180f85cafaa712019893729c  |

```
Running migration: 1_migrations.js
  Deploying Migrations...
  ... 0x3f5a4a50ead99ad91cec654600bc25a9f54be6bb3687db466bca621bb7a7a98b
  Migrations: 0x0731ce17108d7ba630d19afefdc464868ec54f50
Saving successful migration to network...
  ... 0x012c85b36a4109eca779b138263e430ded7a811d04c424fbacaad861889c6eab
Saving artifacts...
Running migration: 2_FundRequestContract.js
  Deploying EternalStorage...
  ... 0xe158a8abd92e07d14cac07553b435e0987b46569ddb4a064f2b4f1b9d521e80e
  EternalStorage: 0x0821d33c50d2d2d1381b5dfca34900bacad909a7
  Deploying ClaimRepository...
  ... 0xa2c1f25b36513268b69f0a04b486a2db65cedc1f715e6547de77adbb73368924
  ClaimRepository: 0x3f5460cc85921d43f14b99699bfc87ab8aa3ab97
  Deploying FundRepository...
  ... 0xed38543066bdd20e18fbfee6d2189c4c843726a9b1e9ebac13821a6636bb2aa6
  FundRepository: 0x9b13026a4430acbfd3d80d9dea2cebc4e7d1d79a
  Deploying FundRequestContract...
  ... 0x2fff7893643e7718822c4cca6246cdd75e9156fdaa0818fb67efca6b0d24748c
  FundRequestContract: 0xa8aa4ce1bcd0d78bf19889f389cd030dfc96275e
  ... 0xe9881f7241c4e6f37e212395d590f93a13c02ef64126f980470259642a08af4f
  ... 0x84f984c4612b126a9e980144fe2a17b8fdf61b2f14e347ae5a2e47e8d14bd922
  ... 0x0c3c64447084b9a9c95d34793e3992d51e2df70bd4743738c2beb440f68021ee
  ... 0x2ec48553f92146fc57fd84b3c7b875868755a153265bf091a7bfbc7794499dbd
Saving successful migration to network...
  ... 0xd5fc22a45b4e5b5598d75fff2eb8df8d7923691791b2c1c2011425647ed23b9a
Saving artifacts...
Running migration: 3_Preconditions.js
  Deploying TokenWhitelistPrecondition...
  ... 0xa33bce4551b6daaa59510a25d7121f9539f13d1a2af51c3cc6fbbebd92030c76
  TokenWhitelistPrecondition: 0x06d4eccf466d08246856b3f8fc52b13a51cf01ca

```

### Kovan Staging

```
  FundRequestToken: 0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2
  0xToken: 0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570
  EternalStorage: 0xea4f67d52771e177037c5787e3d73c5eca0d83ae
  ClaimRepository: 0x4ac69cfa88e38edd81b192edb084983b24ca8f9e
  FundRepository: 0x309c50ca57ec4f856f9eefffc53586f7cdda046f
  FundRequestContract: 0xea387e184f1366b10c98c08b92cd90eb876dbbc0
  TokenWhitelistPrecondition: 0xec498c0a6bab80c99e4575bbe425dba806db48ea
```




### Kovan dev-web

```
  FundRequestToken: 0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2
  0xToken: 0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570
  EternalStorage: 0x1e5370467e0fa38de1902fa02ed8096b7a81ba74
  FundRequestContract: 0x22b6cf852e39e91f18d4c8b0cb64810d6d49bc27
  ClaimRepository: 0x97590d2ba0b015c6138ee3f744d90e8707f3ff9c
  FundRepository: 0xca9d455591d1573e9f5f42dbd3db348232e583e0
  TokenWhitelistPrecondition: 0xb12e3fe9fac35a79030e428bcec2639183bfeb0f
``
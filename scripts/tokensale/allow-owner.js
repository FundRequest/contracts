const TGE = artifacts.require("./crowdsale/FundRequestTokenGeneration.sol");

module.exports = function (deployer, network, accounts) {

	deployer.then(function(){
		TGE.deployed().then(function(instance) {
			instance.allow(accounts[0], 4).then(function() {
				console.log('done');
			})
		});
	});

	deployer.deploy(TGE,
		FundRequestToken.address,
		accounts[0],
		accounts[1],
		1800,
		(6000 * Math.pow(10, 18)),
		(1) * Math.pow(10, 18)
	);
};
var FND = artifacts.require('./token/FundRequestToken.sol');

contract('FundRequestToken', function (accounts) {
    it("Owner should be able to set mint agents", function () {
        var meta;

        return FND.new("FundRequest",
            "FND",
            666000000000000000000,
            18,
            true).then(function (instance) {
                //TODO: write first test
        });
    });
});
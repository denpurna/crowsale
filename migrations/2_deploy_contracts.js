var Crow = artifacts.require("./Crow");
var CrowSale = artifacts.require("./CrowSale.sol");

module.exports = function(deployer) {
  deployer.deploy(Crow, 100000000).then(function() {
    // Token price is 0.0001 Ether
    var tokenPrice = 100000000000000;
    return deployer.deploy(CrowSale, Crow.address, tokenPrice);
  });
};
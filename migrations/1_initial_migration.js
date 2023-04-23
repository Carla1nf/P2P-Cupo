const Migrations = artifacts.require("Migrations");
const P2P = artifacts.require("P2PContract");
const ERC20 = artifacts.require("Cupon");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(P2P);
  deployer.deploy(ERC20);
};

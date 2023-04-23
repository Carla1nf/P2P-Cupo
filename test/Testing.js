const { assert } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

const P2P = artifacts.require("P2PContract");
const CUPON = artifacts.require("Cupon");
const TOKENS_MINTED = "100000000000000000000000";

require("chai")
    .use(require("chai-as-promised"))
    .should()

let p2pContract;
let cuponContract;
let Payment_ERC20;

contract("", (accounts) => (
  
    before(async () => {
         p2pContract = await P2P.deployed();
         cuponContract = await CUPON.deployed();
         Payment_ERC20 = await CUPON.deployed();
         await cuponContract.mint(TOKENS_MINTED);
         await Payment_ERC20.mint(TOKENS_MINTED, {from: accounts[1]});
         await cuponContract.approve(p2pContract.address, TOKENS_MINTED);
       }),
    it("Create Offer", async () => {

       await p2pContract.createOffer(
            cuponContract.address,
            Payment_ERC20.address,
            1,
            `${100}`
        ).should.be.rejected;
       await p2pContract.whiteListTokens(
            cuponContract.address,
            true
        );
      //  const balanceBefore = await p2pContract
        await p2pContract.createOffer(
            cuponContract.address,
            Payment_ERC20.address,
            1,
            `${100}`
        );

        await p2pContract.createOffer(
            cuponContract.address,
            Payment_ERC20.address,
            1,
            `${100}`, {from: accounts[2]}
        ).should.be.rejected;
    })

))
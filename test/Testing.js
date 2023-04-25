const { expect } = require("chai");
const { ethers } = require("hardhat");


const TOKENS_MINTED = ethers.utils.parseEther("100000");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("P2PContract", function () {
  let p2pContract
  let cuponContract
  let Payment_ERC20

  beforeEach(async function () {
    const P2P = await ethers.getContractFactory("P2PContract");
    const CUPON = await ethers.getContractFactory("Cupon");
    p2pContract = await P2P.deploy();
    cuponContract = await CUPON.deploy();
    Payment_ERC20 = await CUPON.deploy();
    await cuponContract.mint(TOKENS_MINTED);
    await Payment_ERC20.mint(TOKENS_MINTED);
    await cuponContract.approve(p2pContract.address, TOKENS_MINTED);
  });

  it("Create Offer", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await expect(
        p2pContract
      .createOffer(
        cuponContract.address,
        Payment_ERC20.address,
        1,
        ethers.utils.parseEther("100")
      )
    ).to.be.rejected;

    await p2pContract.whiteListTokens(cuponContract.address, true);

    const balanceUser = await cuponContract.balanceOf(owner.address);
    const balanceBefore = await cuponContract.balanceOf(p2pContract.address);

    await p2pContract.createOffer(
      cuponContract.address,
      Payment_ERC20.address,
      1,
      ethers.utils.parseEther("100")
    );

    const balance_AfterUser = await cuponContract.balanceOf(owner.address);
    const balanceAfter = await cuponContract.balanceOf(p2pContract.address);

   await expect(
    p2pContract
      .connect(addr1).createOffer(
        cuponContract.address,
        Payment_ERC20.address,
        1,
        ethers.utils.parseEther("100"),
      )
   ).to.be.reverted; 

   await expect(
    balanceUser.sub(balance_AfterUser).toNumber()
   ).to.equal(1);
   //assert.equal(balanceUser.sub(balance_AfterUser).toNumber(), 1, "Transaction Error");
   // assert.equal(balanceAfter.sub(balanceBefore).toNumber(), 1, "Failed Transaction with Cupon Tokens");
  });

  it("Create Offer and Cancel It", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await p2pContract.whiteListTokens(cuponContract.address, true);
    await p2pContract.createOffer(
      cuponContract.address,
      Payment_ERC20.address,
      1,
      ethers.utils.parseEther("100")
    );

   await expect(p2pContract.connect(addr1).cancelOffer(1)).to.be.reverted;

    const balance_Before_Contract = await cuponContract.balanceOf(p2pContract.address);
    const balance_Before_User = await cuponContract.balanceOf(owner.address);

    expect(balance_Before_Contract.toNumber()).to.equal(1);

    await p2pContract.cancelOffer(1);

    const balance_After_Contract = await cuponContract.balanceOf(p2pContract.address);
    const balance_After_User = await cuponContract.balanceOf(owner.address);
    expect(balance_After_Contract.toNumber()).to.equal(0);
    expect(balance_After_User.sub(balance_Before_User).toNumber()
    ).to.equal(1);  

    })})
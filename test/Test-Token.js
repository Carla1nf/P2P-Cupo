const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");

const TOKENS_MINTED = ethers.utils.parseEther("100000");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("TOKEN", function () {
  let tokenContract


  beforeEach(async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const _tokenContract = await ethers.getContractFactory("CuponF");

    tokenContract = await _tokenContract.deploy(
        TOKENS_MINTED,
        100000,
        "Cupon Token",
        "Cupon",
        addr1.address,
        owner.address
    );

  });   
  it("Testing Limits Token", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await expect( await tokenContract.s_Deadline()
    ).to.equal(100000);
    await tokenContract.transfer(addr2.address, 10);
    await tokenContract.transfer(addr1.address, 10);
    await expect(tokenContract.connect(addr2).transfer(addr1.address, 10)).to.be.rejected;
    await expect(tokenContract.connect(addr1).burnTokens(100, owner.address)).to.be.rejected;
    await tokenContract.approve(owner.address, 100);
    await tokenContract.transferFrom(owner.address, addr1.address, 100);
    await tokenContract.connect(addr1).approve(addr2.address, 5);
    await expect(tokenContract.connect(addr2).transferFrom(addr1.address, 5)).to.be.rejected; // Aunq este aprobado no se puede mover. 

  })
})
const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");

const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");

const TOKENS_MINTED = ethers.utils.parseEther("100000");
const BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
describe("TOKEN", function () {

  let p2p_Deployed;
  let paymentToken;
  beforeEach(async function () {
    const generatorContract = await ethers.getContractFactory("Generator");
    const p2p_CONTRACT = await ethers.getContractFactory("P2PContract");
    p2p_Deployed = await p2p_CONTRACT.deploy();
    _generator = await generatorContract.deploy(p2p_Deployed.address);
    p2p_Deployed.setGeneratorContract(_generator.address);
    const CUPON = await ethers.getContractFactory("Cupon");
    paymentToken = await CUPON.deploy();

  });  

  it("Testing The Flow", async () => {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const cuponContract = await ethers.getContractFactory("CuponF");
    await _generator.setAddress(addr1.address, true); // Aprobar una wallet para que pueda crear Tokens
    const multipleTokens =  await _generator.connect(addr1).createTokens(
      [1000],
      [20000000000],
      ["Cupon Test"],
      ["CUPTEST"],
      ["0x8199de1ff9947e7056e2d373ed9e0906e392c2dfa38723c311230cb1633c3040"]
    );
    const proof = [
      '0xa319797a9154b3b5fd1f8dedb54160cb473bb7cb11c0a9f2108cbe4f32707c5a',
      '0xa8480751751b5b4d4c02a0aaa72d18c713025ece9091506f87533bda35f3cf04',
      '0xc2c33199dcea6991c5800051e47ea8dd3e8fc76ad2257e4c7dfae36a8824f8de',
      '0xd272453acce8562227e769a66aaf94f32535debbc6c6b8af0d4fa9dd6f517090'
    ];

    const data = await multipleTokens.wait();
    const leafHashed = keccak256("ABCD5");

    await _generator.connect(addr2).claimCode(
      leafHashed,
      proof,
      data.events[1].args.tokenAddress
    );
    await paymentToken.connect(addr3).mint(TOKENS_MINTED);
    await paymentToken.connect(addr3).approve(p2p_Deployed.address, TOKENS_MINTED);
    const cuponContract_ = await cuponContract.attach(
      data.events[1].args.tokenAddress
    );
    cuponContract_.connect(addr2).approve(p2p_Deployed.address, 2);
    await p2p_Deployed.connect(addr2).createOffer(
      data.events[1].args.tokenAddress,
      paymentToken.address,
      1,
      TOKENS_MINTED
       );

     await p2p_Deployed.connect(addr3).acceptOffer(1);
     await expect(await paymentToken.balanceOf(addr2.address)).to.equal(TOKENS_MINTED);
     await expect(await paymentToken.balanceOf(addr3.address)).to.equal(0);
     await _generator.connect(addr3).claimDiscount_User(data.events[1].args.tokenAddress, 1);
     await _generator.connect(addr1).confirmUseOfDiscount(1, data.events[1].args.tokenAddress, addr3.address);
  })

})
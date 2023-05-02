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


  beforeEach(async function () {
    const generatorContract = await ethers.getContractFactory("Generator");
    const p2p_CONTRACT = await ethers.getContractFactory("P2PContract");
    let p2p_Deployed = await p2p_CONTRACT.deploy();
    _generator = await generatorContract.deploy(p2p_Deployed.address);
    p2p_Deployed.setGeneratorContract(_generator.address);



  });  

  it("Testing Deployment", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const cuponContract = await ethers.getContractFactory("CuponF");
  await _generator.setAddress(owner.address, true);
  const generatedToken = await  _generator.createTokens(
    [TOKENS_MINTED],
    [100000],
    ["Cupon Token"],
    ["Cupon"],
    [BYTES32]
   );
   const data = await generatedToken.wait();
   const contract = await cuponContract.attach(
    data.events[1].args.tokenAddress
    );
    const balance = await contract.balanceOf(_generator.address);
    expect(balance).to.equal(TOKENS_MINTED);
    await expect(_generator.createTokens(
        [TOKENS_MINTED],
        [100000, 10],
        ["Cupon Token"],
        ["Cupon"],
        [BYTES32]
        
       )).to.be.rejected;


  }),

  it("Testing Multiple Deployments", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const cuponContract = await ethers.getContractFactory("CuponF");
  await _generator.setAddress(owner.address, true);
    const multipleTokens = await _generator.createTokens(
        [10000, 1000, 5],
        [100000, 10, 50],
        ["Cupon Token" ,"Cupon 2", "Cupon 3"],
        ["Cupon", "aa", "cc"],
        [BYTES32, BYTES32, BYTES32]
       );
    const multipleTokens_DATA = await multipleTokens.wait();
     const dataContract = await cuponContract.attach(
        multipleTokens_DATA.events[1].args.tokenAddress
    );
    const dataContract_2 = await cuponContract.attach(
        multipleTokens_DATA.events[3].args.tokenAddress
    );
    const dataContract_3 = await cuponContract.attach(
        multipleTokens_DATA.events[5].args.tokenAddress
    );
    const otherBalance_1 = await dataContract.balanceOf(_generator.address);
     await expect(otherBalance_1).to.equal(10000);

     const otherBalance_2 = await dataContract_2.balanceOf(_generator.address);
     await expect(otherBalance_2).to.equal(1000);

     const otherBalance_3 = await dataContract_3.balanceOf(_generator.address);
     await expect(otherBalance_3).to.equal(5);

  } ),

  it("Check Generated Code", async () => {

    const [owner, addr1, addr2] = await ethers.getSigners();
    const cuponContract = await ethers.getContractFactory("CuponF");
  await _generator.setAddress(owner.address, true);
    const multipleTokens = await _generator.createTokens(
        [10000],
        [100000],
        ["Cupon Token"],
        ["Cupon"],
        ["0x8199de1ff9947e7056e2d373ed9e0906e392c2dfa38723c311230cb1633c3040"]
       );
    
   const proof = [
    '0xa319797a9154b3b5fd1f8dedb54160cb473bb7cb11c0a9f2108cbe4f32707c5a',
    '0xa8480751751b5b4d4c02a0aaa72d18c713025ece9091506f87533bda35f3cf04',
    '0xc2c33199dcea6991c5800051e47ea8dd3e8fc76ad2257e4c7dfae36a8824f8de',
    '0xd272453acce8562227e769a66aaf94f32535debbc6c6b8af0d4fa9dd6f517090'
  ];

  const fakeProof = [
    '0xa319797a9154b3b5fd1f8dedb54160cb473bb7cb11c0a9f2108cbe4f32707c5a',
    '0xa8480751751b5b4d4c02a0aaa72dd8c713025ece9091506f87533bda35f3cf04',
    '0xc2c33199dcea6991c5800051e47ea8dd3e8fc76ad2257e4c7dfae36a8824f8de',
    '0xd272453acce8562227e769a66aaf94f32535debbc6c6b8af0d4fa9dd6f517090'
  ];
  const data = await multipleTokens.wait();
  const leafHashed = keccak256("ABCD5");
  console.log(leafHashed);

await expect(  _generator.claimCode(
    leafHashed,
    fakeProof,
    data.events[1].args.tokenAddress
  )).to.be.rejected;

await _generator.claimCode(
    leafHashed,
    proof,
    data.events[1].args.tokenAddress
  )

  await expect(_generator.claimCode(
    leafHashed,
    proof,
    data.events[1].args.tokenAddress
  )).to.be.rejected;
  }),

  it("Claim Discount", async () => {

  const [owner, addr1, addr2] = await ethers.getSigners();
  const cuponContract = await ethers.getContractFactory("CuponF");
  await _generator.setAddress(owner.address, true);
  const multipleTokens = await _generator.createTokens(
    [10000],
    [100000],
    ["Cupon Token"],
    ["Cupon"],
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
  await expect( _generator.claimDiscount_User(data.events[1].args.tokenAddress, 1)
  ).to.be.rejected;
  await _generator.claimCode(
    leafHashed,
    proof,
    data.events[1].args.tokenAddress
  );
  const contract = await cuponContract.attach(
    data.events[1].args.tokenAddress
    );
    await expect(await contract.balanceOf(owner.address)).to.equal(1);
    await _generator.claimDiscount_User(    data.events[1].args.tokenAddress, 1);
    await expect(await contract.balanceOf(owner.address)).to.equal(0);
    await expect(await _generator.unused_Discount_PerUser(data.events[1].args.tokenAddress, owner.address)).to.equal(1);

  }),

  it("Confirm Generator", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const cuponContract = await ethers.getContractFactory("CuponF");
    await _generator.setAddress(owner.address, true);
    const multipleTokens = await _generator.createTokens(
      [10000],
      [100000],
      ["Cupon Token"],
      ["Cupon"],
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
    await _generator.connect(addr1).claimCode(
      leafHashed,
      proof,
      data.events[1].args.tokenAddress
    );
    await _generator.connect(addr1).claimDiscount_User(data.events[1].args.tokenAddress, 1);
  await expect( _generator.connect(addr2).confirmUseOfDiscount(1, data.events[1].args.tokenAddress, addr1.address
    )).to.be.rejected;
  const balanceBefore =  await _generator.unused_Discount_PerUser(data.events[1].args.tokenAddress, addr1.address);
   await _generator.confirmUseOfDiscount(1, data.events[1].args.tokenAddress, addr1.address);

   const balanceAfter = await _generator.unused_Discount_PerUser(data.events[1].args.tokenAddress, addr1.address);
   expect(balanceBefore).to.equal(1);
   expect(balanceAfter).to.equal(0);
  });


})
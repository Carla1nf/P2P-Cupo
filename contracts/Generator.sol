pragma solidity ^0.8.0;

import "./new_Token.sol";
import "./P2P.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Generator {
    event DiscountClaimed(address tokenAddress, address owner);
    event Discount_USED(address tokenAddress, address owner);
    event TokenCreated(address tokenAddress, address _owner);
    event CodeClaimed(address tokenAddress, address newOwner);

    address owner;
    address s_p2pAddress;
    mapping(address => bool) isAddressApproved;
    mapping(address => bytes32) rootPerToken;
    // Root => Leaf => True|False
    mapping(bytes32 => mapping(bytes32 => bool)) codeAlreadyUsed;

    //  Token Address => Discount Owner => Units
    mapping(address => mapping(address => uint)) public unused_Discount_PerUser;

    mapping(address => address) public ownerPerToken;

    constructor(address p2p) {
        s_p2pAddress = p2p;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }

    function createTokens(
        uint[] memory _supply,
        uint[] memory deadLine,
        string[] memory tokenName,
        string[] memory tokenSymbol,
        bytes32[] memory newRoot
    ) public {
        if (!isAddressApproved[msg.sender]) {
            revert();
        }
        if (
            _supply.length != deadLine.length ||
            _supply.length != tokenName.length ||
            _supply.length != tokenSymbol.length ||
            _supply.length != newRoot.length

        ) {
            revert();
        }

        for (uint i; i < _supply.length; i++) {
            CuponF token = new CuponF(
                _supply[i],
                deadLine[i],
                tokenName[i],
                tokenSymbol[i],
                s_p2pAddress,
                address(this)
            );
            P2PContract _p2pContract = P2PContract(s_p2pAddress);
            _p2pContract.whiteListTokens(address(token), true);
            rootPerToken[address(token)] = newRoot[i];
            ownerPerToken[address(token)] = msg.sender;
            emit TokenCreated(address(token), owner);
        }
    }

    // Receive Bytes (Leaf) and Path
    function claimCode(
        bytes32 leaf,
        bytes32[] memory proof,
        address tokenAdd
    ) public {
        bytes32 root = rootPerToken[tokenAdd];
        if(codeAlreadyUsed[root][leaf]) {
            revert();
        }
        if(!MerkleProof.verify(proof, root, leaf)) {
            revert();
        }
       codeAlreadyUsed[root][leaf] = true;
       CuponF cuponContract = CuponF(tokenAdd);
       cuponContract.transfer(msg.sender, 1);
       emit CodeClaimed(tokenAdd, msg.sender);
    }

    function claimDiscount_User(address _tokenAdd, uint amount) public {
        CuponF token = CuponF(_tokenAdd);
        token.burn(msg.sender, amount);
        unused_Discount_PerUser[_tokenAdd][msg.sender] += amount;
        emit DiscountClaimed(_tokenAdd, msg.sender);

    }

    function confirmUseOfDiscount(uint amount, address _tokenAdd, address discountOwner) public {
      if(msg.sender != ownerPerToken[_tokenAdd]) {
        revert();
      } 

      if(unused_Discount_PerUser[_tokenAdd][discountOwner] < amount) {
        revert();
      } 
      unused_Discount_PerUser[_tokenAdd][discountOwner] -= amount;
      emit Discount_USED(_tokenAdd, discountOwner);
}

    function setAddress(address _wallet, bool status) public onlyOwner {
        isAddressApproved[_wallet] = status;
    }

    function setP2pAddress(address newAdress) public onlyOwner {
        s_p2pAddress = newAdress;
        }
}

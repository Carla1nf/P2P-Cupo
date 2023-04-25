pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract P2PContract {
    event OfferCreated(uint deadLine, uint Id, address cupon_Add);
    event OfferDeleted(uint Id, address cupon_Add, address owner);
    event OfferAccepted(uint Id, address cupon_Add);

    constructor() {
        owner = msg.sender;
    }

    struct OfferStruct {
        address offer_OWNER;
        address cupon_Address;
        address priceToken_Address;
        uint cupon_Amount;
        uint priceToken_Amount;
        uint deadLine;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }

    uint public s_ID;
    address owner;
    mapping(uint => OfferStruct) public OfferData_PER_ID;
    mapping(address => bool) isTokenAllowed;

    function createOffer(
        address cupon_Add,
        address priceToken_Add,
        uint cuponAmount,
        uint price
    ) public {
        if (!isTokenAllowed[cupon_Add]) {
            revert();
        }
        IERC20 cuponToken = IERC20(cupon_Add);
        cuponToken.transferFrom(msg.sender, address(this), cuponAmount);
        s_ID++;
        OfferStruct memory _offerData = OfferStruct({
            offer_OWNER: msg.sender,
            cupon_Address: cupon_Add,
            priceToken_Address: priceToken_Add,
            cupon_Amount: cuponAmount,
            priceToken_Amount: price,
            deadLine: block.timestamp + 2 days // Placeholder Deadline
        });
        OfferData_PER_ID[s_ID] = _offerData;
        emit OfferCreated(block.timestamp + 2 days, s_ID, cupon_Add);
    }

    function cancelOffer(uint _id) external {
        OfferStruct memory _offerData = OfferData_PER_ID[_id];
        if (_offerData.offer_OWNER != msg.sender) {
            revert();
        }
        delete OfferData_PER_ID[_id];
        IERC20 cuponToken = IERC20(_offerData.cupon_Address);
        cuponToken.transfer(_offerData.offer_OWNER, _offerData.cupon_Amount);
        emit OfferDeleted(_id, _offerData.cupon_Address, _offerData.offer_OWNER);
    }

    function acceptOffer(uint _id) external {
        OfferStruct memory _offerData = OfferData_PER_ID[_id];
        if (_offerData.deadLine <= block.timestamp) {
            revert();
        }
        IERC20 payment_TOKEN = IERC20(_offerData.priceToken_Address);
        payment_TOKEN.transferFrom(
            msg.sender,
            _offerData.offer_OWNER,
            _offerData.priceToken_Amount
        );
        delete OfferData_PER_ID[_id];
        IERC20 cupon_TOKEN = IERC20(_offerData.cupon_Address);
        cupon_TOKEN.transferFrom(
            address(this),
            msg.sender,
            _offerData.cupon_Amount
        );
        emit OfferAccepted(_id, _offerData.cupon_Address);
    }

    function whiteListTokens(
        address tokenWhiteList,
        bool status
    ) external onlyOwner {
        isTokenAllowed[tokenWhiteList] = status;
    }
}

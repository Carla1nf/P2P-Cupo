
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Cupon is ERC20 {

constructor() ERC20("Cupon TOKEN", "Cupon"){

}

function mint(uint amount) public {
    _mint(msg.sender, amount);
}

}
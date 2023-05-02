pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CuponF is ERC20 {


uint public s_Deadline;
string s_TokenName;
string s_TokenSymbol;
address p2pContract;  // Should be constant
address generatorContract; // Should be constant

constructor (
    uint _supply,
    uint deadLine,
    string memory tokenName,
    string memory tokenSymbol,
    address _p2p,
    address generator
) ERC20("", "") {
s_Deadline = deadLine;
s_TokenName = tokenName;
s_TokenSymbol = tokenSymbol;
p2pContract = _p2p;
generatorContract = generator;
_mint(msg.sender, _supply);
}


 function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = msg.sender;
        if(owner != p2pContract && owner != generatorContract) {
            revert();
        }
        _transfer(owner, to, amount);
        return true;
    }
  
  function burn(address wallet, uint amount) public {
    if(msg.sender != generatorContract){
        revert();
    }
    _burn(wallet, amount);
  }

 function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = msg.sender;
        if(spender != p2pContract && spender != generatorContract) {
            revert();
        }
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

function symbol() public view override returns(string memory) {
    return s_TokenSymbol;
}


function name() public view override returns(string memory) {
    return s_TokenName;
}




}
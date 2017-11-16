pragma solidity ^0.4.17;


import "../abstract-classes/erc223-basic.sol";
import "../abstract-classes/erc223-reciever.sol";
//TODO test to see if contract owner can change the amount of total supply
contract basicToken is abstractBasicToken
{
  function basicToken(string symbol, string name, uint8 decimals,uint256 totalSupply) public
  {
    _symbol = symbol;
    _name = name;
    _decimals = decimals;
    _owner = msg.sender;
    _balances[_owner] =totalSupply;
    _totalSupply = totalSupply;
  }

  function balanceOf(address addr) public view returns (uint256)
  {
    BalanceOf( addr , _balances[addr] );
    return _balances[addr] ;
  }
  function getOwner() public returns (address)
  {
      GetOwner(_owner);
      return _owner;
  }
  function totalSupply() public view returns (uint256)
  {
    TotalSupply(_totalSupply);
    return _totalSupply;
  }


  function transfer(address reciever, uint256 amount, bytes data) public returns (bool)
  {

    // Throw an error and fail if If balnce of sender is smaller than the amount of tokens sender has.
    // Question : Should I make it larger than or equal ??
    require (balanceOf(msg.sender) > amount) ;
    require (reciever!=0x0);
    //subtrack the amount of tokens from sender
    _balances[msg.sender] = _balances[msg.sender].sub(amount);
    _balances[reciever] = _balances[reciever].add(amount);

    if (isContract(reciever))
    {
      abstractReciever receiverContract = abstractReciever(reciever);
      receiverContract.tokenFallback(msg.sender, amount, data);

    }
    Transfer(msg.sender, reciever, amount, data);
    return true;

  }

  function  transfer(address reciever, uint256 amount) public  returns (bool){
        bytes memory empty;
        bool gotTransfered =  transfer(reciever , amount ,empty);

        if (gotTransfered)
          return true;
        else
          return false;
   }

   function burn(uint256 amount) public  returns (bool){
     require(amount>0);
     require(_balances[msg.sender]>=amount);
     _balances[msg.sender] = _balances[msg.sender].sub(amount);
     _totalSupply = _totalSupply.sub(amount);
     Burn(msg.sender,amount);
     return true;
   }


  //private functions
  function isContract(address addr) private view returns (bool) {
    uint length;
    assembly {
          //retrieve the size of the code on target address, this needs assembly
          length := extcodesize(addr)
    }
    return (length>0);
  }

}

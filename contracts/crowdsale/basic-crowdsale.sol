pragma solidity ^0.4.17;
import "../abstract-classes/erc223-crowdsale.sol";
import "../tokens/basic-token.sol";

import "../abstract-classes/erc223-reciever.sol";

contract basicCrowdsale is CrowdSale {


  function basicCrowdsale(  uint256 startTime, uint256 endTime, address wallet
                            ,string symbol, string name, uint8 decimals
                            ,uint256 totalSupply) public CrowdSale(startTime,endTime,wallet)
  {
    _token = new basicToken(symbol, name, decimals, totalSupply);
  }






  function getRate() public view returns (uint256)
  {
    require(validPurchase());

    if(_startTime <= now && now <=_endTime.sub(500) )
    {
      return 10;
    }
    else
    {
      return 5 ;
    }

  }

  function buyTokens(address reciever) public payable returns (bool)
  {
    //TODO : add whitelist checks
    require(reciever != 0x0);
    uint256 rate ;
    rate = getRate();
    require(rate!=0);
    uint256 weiAmount = msg.value;
    uint256 amount = weiAmount.mul(rate);
    _weiRaised = _weiRaised.add(weiAmount);
    _token.transfer(reciever,amount);
    TokenPurchase(msg.sender, reciever, weiAmount, amount);
  }

  function finalize() public returns (bool)
  {
    address owner = _token.getOwner();
    require (msg.sender == owner  );
    require(!isFinalized);
    require(now > _endTime );
    uint256 remaining = _token.balanceOf (owner);
    if (remaining > 0 )
    {
      _token.burn(remaining);
    }

  }


}

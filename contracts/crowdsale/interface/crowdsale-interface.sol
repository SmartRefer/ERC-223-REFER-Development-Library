pragma solidity ^0.4.18;
import "../../tokens/token.sol";

//TODO : Add dynamic rate
interface crowdsaleInterface
{
  function buyTokens(address receiver,uint256 weiAmount) public returns(uint256);
  function getToken() public returns(address);
  function getOwner() public returns(address);
  function getAddress() public returns(address);
  function getRate() public returns(uint256);
  function finalize() public returns(bool);

}

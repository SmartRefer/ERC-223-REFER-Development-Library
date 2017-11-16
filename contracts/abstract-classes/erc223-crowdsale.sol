pragma solidity ^0.4.17;
import "./token-interface.sol";
import "./erc223-basic.sol";
import "../libraries/SafeMath.sol";
import "../tokens/basic-token.sol";

/*
 * @title
 * @dev
 */
contract CrowdSale
{
  using SafeMath for uint256;
  Token   public _token;
  uint256 public _startTime;
  uint256 public _endTime;
  uint8   public _stage;
  address public _wallet;
  uint256 public _weiRaised;
  bool public isFinalized = false;


  function getRate() public view returns (uint256) ;
  function buyTokens(address reciever) public payable returns (bool);
  function finalize() public returns (bool);

  function CrowdSale(uint256 startTime, uint256 endTime, address wallet) internal
  {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_wallet != 0x0);
    startTime = _startTime;
    endTime = _endTime;
    wallet = _wallet;
  }

  function validPurchase() internal view returns (bool)
  {
    require(_startTime <= now);
    require( _endTime >= now);
    require(!isFinalized);
    require(msg.value != 0);
    return true;

  }

  function () public payable
  {
      revert();
  }

  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

}

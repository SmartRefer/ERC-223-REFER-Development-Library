pragma solidity ^0.4.18;
import "../../libraries/SafeMath.sol";
import "../interface/crowdsale-interface.sol";
import "../../tokens/token.sol";

/*@title Receiver contract Abstract Class
 *@dev this is an abstract class that is the building block of any contract that is supposed to recieve ERC223 token
 */
 //TODO add owner checks
 //TODO add cap
contract basicCrowdsale is crowdsaleInterface {
  using SafeMath for uint256;

  //State
  uint256 private _startTime;
  uint256 private _endTime;
  address private _wallet;
  address private _owner;
  uint256 private _weiRaised;
  uint256 private _tokensIssued;
  token private _token;
  bool private isFinalized = false;




  function basicCrowdsale(uint256 startTime, uint256 endTime,string symbol, string name, uint8 decimals, uint256 totalSupply) public
  {
    if (startTime < now) {
        revert();
    } else if (endTime < now || endTime < startTime) {
        revert();
    } else {
        _startTime = startTime;
        _endTime = endTime;
        _owner = msg.sender;
    }
    _token = new token(symbol, name, decimals, totalSupply);

  }
  //check for valid purchase
  function buyTokens(address receiver,uint256 weiAmount) public onlyOwner returns(uint256)
  {

      validPurchase();
      if(receiver == 0x0)
      {
          revert();
      }
      else if(receiver == address(0))
      {
          revert();
      }

      else
      {
          //TODO : Add dynamic rate
          _weiRaised = _weiRaised.add(weiAmount);
          // Finding total amount that uas to get transferred
          uint256 rate = getRate();
          uint256 tokens = weiAmount.mul(rate);

          _token.mint(receiver, tokens);
          return tokens;
      }
  }
  function finalize() public onlyOwner returns(bool)
  {

      //Safety Check : make sure the contact hasn't been finalized yet
      if (isFinalized == true) {
          revert();
      }
      //Safety Check : make sure current time is passed set end time of crowdsale
      else if (now < _endTime) {
          revert();
      }
      else
      {
          //Finalize mechanism : if there are tokens remaining, burn them.
          _token.finalize();
          isFinalized = true;
          return true;
      }

  }
  function getToken() public returns(address)
  {
    return address(_token);
  }
  function getOwner() public returns(address)
  {
    return _owner;
  }
  function getAddress() public returns(address)
  {
    return address(this);
  }

  function getRate() public returns(uint256)
  {
    uint256 rate = 50;
    return rate;
  }

    /*
     * @dev this function checks to make sure some basic constraints of a crowdsale is met
     * @returns a boolean value indicating success or failure of this operation
     */

    function validPurchase() internal view returns(bool) {

        if (_startTime > now) {
            revert();
        }

        else if (_endTime < now ) {
            revert();
        }
        else if( _endTime <= _startTime)
        {
          revert();
        }
        else if (isFinalized == true)
        {
            revert();
        }

        else
        {
            return true;
        }


    }
    modifier onlyOwner
    {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        _;
      }
    }
}

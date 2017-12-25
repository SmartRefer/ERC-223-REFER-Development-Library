pragma solidity ^0.4.18;
import "../../libraries/SafeMath.sol";
import "../interface/crowdsale-interface.sol";
import "../../tokens/token.sol";

/*@title Receiver contract Abstract Class
 *@dev this is an abstract class that is the building block of any contract that is supposed to recieve ERC223 token
 */
 //TODO add owner checks
 //TODO add cap
contract simpleCrowdsale is crowdsaleInterface {
  using SafeMath for uint256;

  //State
  uint256 private _startTime;
  uint256 private _endTime;
  address private _wallet;
  address private _owner;
  uint256 private _weiRaised;
  uint256 private _tokenSold;
  uint256 private _cap;
  uint256 private _rate;
  token private _token;
  bool private _finalized = false;




  function simpleCrowdsale(uint256 startTime, uint256 endTime,string symbol, string name, uint8 decimals, uint256 totalSupply,uint256 cap , uint256 rate) public
  {
    if (startTime < now) {
        revert();
    } else if (endTime < now || endTime < startTime) {
        revert();
    } else {
      _startTime = startTime;
      _endTime = endTime;
      _cap = cap;
      _rate = rate;
      _tokenSold = 0;
      _weiRaised = 0;
      _owner = msg.sender;
      _token = new token(symbol, name, decimals, totalSupply);
    }

  }
  //check for valid purchase
  function buyTokens(address receiver,uint256 weiAmount) public onlyOwner isFinalized returns(uint256)
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
          _tokenSold = _tokenSold.add(tokens);
          if(_tokenSold>_cap)
          {
            revert();
          }
          else
          {
            _token.mint(receiver, tokens);
            return tokens;
          }
      }
  }
  function finalize() public onlyOwner isFinalized returns(bool)
  {


      //Safety Check : make sure current time is passed set end time of crowdsale
      if (now < _endTime) {
          revert();
      }
      else
      {
          //Finalize mechanism : if there are tokens remaining, burn them.
          _token.finalize();
          _finalized = true;
          return true;
      }

  }
  function getToken() public onlyOwner returns(address)
  {
    return address(_token);
  }
  function getOwner() public  onlyOwner returns(address)
  {
    return _owner;
  }
  function getAddress() public  onlyOwner returns(address)
  {
    return address(this);
  }

  function getRate() public  onlyOwner returns(uint256)
  {
    return _rate;
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
        else if (_finalized == true)
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
    modifier isFinalized
    {
      if(_finalized==true)
      {
        revert();
      }
      else
      {
        _;
      }
    }

}

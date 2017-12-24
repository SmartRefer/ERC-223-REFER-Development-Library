pragma solidity ^0.4.18;
import "../../libraries/SafeMath.sol";
import "../interface/crowdsale-interface.sol";

/*@title Receiver contract Abstract Class
 *@dev this is an abstract class that is the building block of any contract that is supposed to recieve ERC223 token
 */
contract mintableCrowdsale is crowdsaleInterface {
  using SafeMath for uint256;

  //State
  uint256 private _startTime;
  uint256 private _endTime;
  address private _wallet;
  address private _owner;
  uint256 private _weiRaised;
  uint256 private _cap;
  bool private isFinalized = false;



  function basicCrowdsale(uint256 startTime, uint256 endTime,uint256 cap,string symbol, string name, uint8 decimals, uint256 totalSupply) public
  {
    if (startTime < now) {
        revert();
    } else if (endTime < now || endTime < startTime) {
        revert();
    } else {
        _startTime = startTime;
        _endTime = endTime;
        _cap = cap;
        _owner = msg.sender;
    }
  }
  //check for valid purchase
  function buyTokens(address receiver,uint256 weiAmount) public  returns(uint256)
  {
    return 256;

  }
  function getRate() public returns(uint256)
  {
    return 256;
  }
  function finalize() public returns(bool)
  {

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
        else if (msg.value == 0)
        {
            revert();
        }
        else
        {
            return true;
        }


    }

}

pragma solidity ^0.4.18;
import "./interface/crowdsale-interface.sol";
import "./implementation/basic-crowdsale.sol";
import "../tokens/token.sol";
/*import "../libraries/SafeMath.sol";*/
//TODO: add set rate
//TODO: add cap
//Todo : Add contract suicide
/*
 * @title CrowdSale
 * @dev The following is a basic boilerplate for any crowd sale.
 * @dev to create a crowd sale, extend this contract
 */
contract crowdsale{
  /*using SafeMath for uint256;*/

  address private _owner;
  address private _wallet;

  crowdsaleInterface private _crowdsale;
  /*
   * @dev constructor : it sets initial variables that is needed for any crowdsale
   * @dev it also checks to make sure some basic constraints are met.
   * @dev it has to be overwritten when this contract is being implemented by other contracts to create a crowdsale
   * @params uint256 startTime represents start time of the crowdsale
   * @params uint256 endTime represents when the CrowdSale ends
   * @params address wallet represents a wallet address in which all the funds are accumulated
   */
  //Todo make internal
  function crowdsale(uint256 startTime, uint256 endTime,uint256 cap, address wallet,string symbol, string name, uint8 decimals, uint256 totalSupply, uint256 rate) public
  {
    _owner = msg.sender;
    if (wallet == 0x0 || wallet == address(0))
    {
      revert();
    }
    else
    {
      _wallet = wallet;
      _crowdsale= new simpleCrowdsale(startTime,endTime,symbol,name,decimals,totalSupply,cap,rate) ;
    }
  }

  /*
   * @dev this function is called when the contract recieves ethers. it would call buyTokens() functon
   */

   //TODO : Make sure currect msg.value gets passed along
  function() public payable {
      uint256 amount = _crowdsale.buyTokens(msg.sender,uint256(msg.value));
      if (amount>0)
      {
                //Transfer recieved ethers to our wallet
                _wallet.transfer(msg.value);
                TokenPurchase(msg.sender, uint256(msg.value),amount);
      }
      else
      {
        revert();
      }
  }
  /*
   * @dev this function is invoked when someone sends ether to buy tokens
   * @params address receiver is wallet addressof the person who is contributing ethers to the crowdsale
   * @returns a boolean value indicating success or failure of this operation
   */

//TODO : Is it even needed?

  /*function buyTokens(address receiver) public payable returns(bool)
  {
    bool value = _crowdsale.buyTokens(receiver);
    return value;
  }*/
  //TODO : Is returning token address a security issue?
  function getToken() public returns(address)
  {
    address value = _crowdsale.getToken();
    return value;
  }
  function getOwner() public returns(address)
  {
    return _owner;
  }
  function getChildOwner() public returns(address)
  {
    address value = _crowdsale.getOwner();
    return value;

  }
  function getChildAddress() public returns(address)
  {
    address value = _crowdsale.getAddress();
    return value;
  }


  /*
   * @dev this function is called after the crowdsale is over to do actions
      that are required to be taken after the crowdsale is over.
   * @returns a boolean value indicating success or failure of this operation
   */
  function finalize() public returns(bool)
  {
    if(msg.sender!=_owner)
    {
      revert();
    }
    else
    {
        bool result = _crowdsale.finalize();
        return result;
    }

  }
  //Todo make sure this event does not cause any issue
  event TokenPurchase(address indexed sender, uint256 value, uint256 amount);
  /*event Finalize (bool finalized , uint256 burned);*/
  //Todo : comment the following events out

}

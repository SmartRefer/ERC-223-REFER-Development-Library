pragma solidity ^0.4.18;
import "./interface/receiver-interface.sol";
import "./implementation/simple-receiver.sol";

/*@title Receiver contract Abstract Class
 *@dev this is an abstract class that is the building block of any contract that is supposed to recieve ERC223 token
 */
contract Receiver {

  /*address internal _acceptedAddress;*/
    address private _owner;
    receiverInterface private _receiver;
    function Receiver() public {
      _owner = msg.sender;
      _receiver=new simpleReciever();
    }
    //remove
    function getOwner() returns (address)
    {
      return _owner;
    }
    /*
     *@dev this is the fallback function that is invoked when a contract recieves ERC223 tokens
     *@params address addr is the address that sends tokens to this contract
     *@params uint value is the number of tokens being sent to this contract
     *@params bytes data is the message that was sent to this contract
     *@returns a boolean value representing success or failure of the operation
     */
    function tokenFallback(address addr, uint256 value, bytes data) public returns(bool)
    {

      bool result = _receiver.tokenFallback(msg.sender,addr,value,data);
      return result;
    }
    function whitelist(address tokenAddress) public returns(bool)
    {
      bool result;
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        result = _receiver.whitelist(tokenAddress);
        if(result)
        {
          Whitelist(tokenAddress);
        }
        return result;
      }
    }
    function blacklist(address tokenAddress) public returns(bool)
    {
      bool result;
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        result = _receiver.blacklist(tokenAddress);
        if(result)
        {
          Blacklist(tokenAddress);
        }
        return result;
      }
    }
    

    event Whitelist(address indexed token);
    event Blacklist(address indexed token);



}

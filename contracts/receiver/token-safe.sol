pragma solidity ^0.4.18;
import "../abstract-classes/erc223-token-safe.sol";
/*import "../abstract-classes/erc223-receiver.sol";*/
import "../libraries/SafeMath.sol";
//The following can also be mintable token
import "../tokens/basic-token.sol";
contract tokenSafe is abstractTokenSafe {
using SafeMath for uint256;

  //state
 struct DepositStruct
 {
   uint256 _value;
   uint256 _depositedBlock;
 }
 //we are using queue as a data structure
 mapping(address => uint256) private _head;


 mapping(address => uint256) private _tail;
 // [owner address] => {
 //                    (index => DepositStruct)
 //                     }
 //
 mapping(address =>mapping(uint256=>DepositStruct)) private _heldBalances;
 address private _owner ;
 basicToken private _token;
 uint256 public _lockDuration;

 function tokenSafe(address tokenAddress,uint256 lockDuration ) public abstractTokenSafe(tokenAddress){
   _lockDuration = lockDuration;
   _token = basicToken(_acceptedAddress);
   _owner = msg.sender;
   _underMaintenance = false;
 }

  function tokenFallback(address addr, uint value, bytes data) public pausable tokenPayable returns(bool)
  {

        uint256 index = _tail[addr] ;
        _heldBalances[addr][index]._value = value;
        _heldBalances[addr][index]._depositedBlock = now;
        _tail[addr] = _tail[addr].add(1);
        return true;
  }

  function getFirstDepositID(address owner) view returns(uint256)
  {
    uint256 result = _head[owner];
    return result;
  }
  function getLastDepositID(address owner) view returns(uint256)
  {
    uint256 result =  _tail[owner];
    return result;
  }
  function getUserDepositCounts(address owner) view returns(uint256)
  {
    uint256 head = _head[owner];
    uint256 tail =  _tail[owner];
    uint256 result = tail.sub(head);
    return result;
  }
  function getUserDepositValue(address owner,uint256 depositID) view returns(uint256)
  {
      return _heldBalances[owner][depositID]._value;
  }


  function getUserDepositBlock(address owner,uint256 depositID) view  returns(uint256)
  {
        return _heldBalances[owner][depositID]._depositedBlock;
  }
  function withdraw() public pausable returns(bool)
  {
      uint256 head = _head[msg.sender];
      uint256 tail = _tail[msg.sender];
      if(head<tail)
      {
        if(now.sub(_lockDuration)>=_heldBalances[msg.sender][head]._depositedBlock)
        {
          uint256 value = getUserDepositValue(msg.sender,head);
          _token.transfer(msg.sender,value);
          _heldBalances[msg.sender][head]._value = 0;
          _head[msg.sender] = _head[msg.sender].add(1);
          if(  head==tail )
          {
            _head[msg.sender] = 0 ;
            _tail[msg.sender] = 0 ;
          }
          Withdraw(msg.sender,value);
          return true;
        }
        else
        {
            revert();
        }
      }
      else
      {
        return false;
      }
    }
  function getLockDuration() view returns (uint256) {
    return _lockDuration;
  }
  function setLockDuration(uint256 duration)  public pausable returns (bool) {
    if(msg.sender!=_owner)
    {
      revert();
    }
    else
    {
      _lockDuration = duration;
      return true;
    }

  }
  function transferOwnership(address addr)  public pausable returns(bool)
  {
    if(msg.sender!=_owner)
    {
      revert();
    }
    else if(addr==_owner)
    {
      revert();
    }
    else
    {
      _owner =addr;
    }
  }
  function pause() public returns(bool)
  {
    if(msg.sender!=_owner)
    {
      revert();
    }
    else
    {
      _underMaintenance = true;
      return true;
    }
  }
  function resume()public returns(bool)
  {
    if(msg.sender!=_owner)
    {
      revert();
    }
    else
    {
      _underMaintenance = false;
      return true;
    }
  }


}

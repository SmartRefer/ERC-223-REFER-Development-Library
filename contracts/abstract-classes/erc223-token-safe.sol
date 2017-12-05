pragma solidity ^0.4.18;
import "./erc223-receiver.sol";
/*
 * @title abstractTokenSafe
 * @dev this is a contract that would lock up tokens sent to it for a certain period of time .
 */
contract abstractTokenSafe is abstractReciever
{

  bool public _underMaintenance;

  function abstractTokenSafe(address tokenAddress) public
  {
    _acceptedAddress = tokenAddress;
  }
  /*
   *@dev This function would return the ID of an address first deposit (Head of queue)
   *@params address owner reprent an address of which we want to find out the first depositID
   *@returns  uint256 that represents FIrst deposit's ID
   */
  function getFirstDepositID(address owner) view returns(uint256);

  /*
   *@dev This function would return the ID of an address last deposit (tail of queue)
   *@params address owner reprent an address of which we want to find out the last deposit ID
   *@returns  uint256 that represents last deposit's ID
   */
  function getLastDepositID(address owner) view returns(uint256);

  /*
   *@dev this function would return how many times  user deposited into this conract
   *@params address owner reprent an address of which we want to find out number if deposites
   *@returns uint256 representin the number of time a user has sent tokens to this contract
   */
  function getUserDepositCounts(address owner) view returns(uint256);
  /*
   *@dev this function would return how much is the vaue of a user deposit
   *@params address owner represent an address of which we want to find out the deposit value
   *@params uint256 depositID represent the deposit Id which we are using as an index
   *@returns uint256 representing total tokens in that deposit
   */
  function getUserDepositValue(address owner,uint256 depositID) view returns(uint256);

  /*
   *@dev this function would returnthe block when the deposit was made
   *@params address owner represent an address of which we want to find out the block time
   *@params uint256 depositID represent the deposit Id which we are using as an index
   *@returns a uint representing block time
   */
  function getUserDepositBlock(address owner,uint256 depositID) view  returns(uint256);
  /*
   *@dev this function would withdraw the tokens in the first deposit (head of queue)
   *if the lock period is passed and return it to owner
   *@returns bool representing success or failure of operation
   */
  function withdraw() public pausable returns(bool);
  /*
   *@dev this function would return the lock duration for tokens
   *@returns uint256 representing lock duration of tokens
   */
  function getLockDuration() view returns (uint256);

  /*
   *@dev only this contracts owner can change the tokens lock duration
   *@params uint256 duration represents the amount of time each tokens is forced to be locked
   *@returns bool representing success or failure of operation
   */
  function setLockDuration(uint256 duration)  public pausable returns (bool);
  /*
   *@dev only this contracts owner can transfer it's ownership to another address
   *@params address addr represents the address of this contracts new owner.
   *@returns bool representing success or failure of operation
   */
  function transferOwnership(address addr)  public pausable returns(bool);

  /*
   *@dev only the owner can pause the operation of this contract , making it stop recieving any tokens
   *@returns bool representing success or failure of operation
   */
  function pause() public returns(bool);
  /*
   *@dev only the owner can resume the operation of this contract , making it possible to recieve tokens
   *@returns bool representing success or failure of operation
   */
  function resume()public returns(bool);
  modifier pausable() {
    if(_underMaintenance==true)
    {
      revert();
    }
    _;
  }
  event Withdraw(address addr,uint256 amount);



}

pragma solidity ^0.4.17;
import "./token-interface.sol";
import "../libraries/SafeMath.sol";

/*
 * @title Basic token
 * @dev This ERC223 token is the most basic of them all ; the total amount of
    tokens are first created and stored in the contract's owner address.
 * These tokens cannot be burned
 * The total supply is created first ( it is capped ) and allocated to different
 addresses during ICO

 */
contract abstractBasicToken is Token {
  using SafeMath for uint256;

  //State
  string internal _symbol;
  string internal _name;
  uint8 internal _decimals;
  uint256 internal _totalSupply;
  address internal _owner;

  mapping(address => uint256) internal _balances;

  /*
  * @dev get balance of a tokens address
  * @return A uint256 representing an address balance
  */
  function balanceOf(address addr) public view returns (uint256);

  /*
  * @dev get total amount of tokens created
  * @return A uint256 representing the number oif tokens created.
  */
  function totalSupply() public view returns (uint256);

  /*
  * @dev get total amount of tokens created
  * @return A uint256 representing the number oif tokens created.
  */


  function getOwner() public returns (address);

  /*
  * @dev transfer function that is called when user or a contract wants to transfer tokens.
  * @params to is the address tokens are being transferred to
  * @params amount is the amount of tokens being transfered
  * @params data
  * @return A uint8 representing token's decimals
  */
  function transfer(address reciever, uint256 amount, bytes data) public returns (bool);

  /*
  * @dev transfer function that is called when user or a contract wants to transfer tokens. [backward compatiblity]
  * @params to is the address tokens are being transferred to
  * @params amount is the amount of tokens being transfered
  * @return A uint8 representing token's decimals
  */
  function  transfer(address reciever, uint256 amount) public  returns (bool);

  /*
  * @dev
  * @params
  * @params
  * @params
  * @return
  */
  function burn(uint256 amount) public returns (bool);

  event TotalSupply(uint256 totalSupply);
  event BalanceOf(address addr , uint256 balance);
  event Burn(address indexed reciever, uint256 amount);
  event Transfer(address indexed sender, address indexed reciever, uint256 amount, bytes  data);
  event GetOwner(address indexed owner);

}

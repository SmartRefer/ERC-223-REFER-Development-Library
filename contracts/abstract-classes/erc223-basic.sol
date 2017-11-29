pragma solidity ^0.4.17;
import "./token-interface.sol";
import "../libraries/SafeMath.sol";

/*
 * @title Basic token
 * @dev This ERC223 token is the most basic of them all ; the total amount of
    tokens are first created and stored in the contract's owner address.
 * @dev The total supply is created first ( it is capped ) and sent to different
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
    
    function balanceOf(address addr) public view returns(uint256);
    function totalSupply() public view returns(uint256);
    function getOwner() public returns(address);
    function transfer(address receiver, uint256 amount, bytes data) public returns(bool);
    function transfer(address receiver, uint256 amount) public returns(bool);
    function burn(uint256 amount) public returns(bool);

    //Events
    event TotalSupply(uint256 totalSupply);
    event BalanceOf(address addr, uint256 balance);
    event Burn(address indexed receiver, uint256 amount);
    event Transfer(address indexed sender, address indexed receiver, uint256 amount, bytes data);
    event GetOwner(address indexed owner);

}
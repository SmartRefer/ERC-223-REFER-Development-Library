pragma solidity ^0.4.18;
import "../libraries/SafeMath.sol";
//Todo : Add token owner transfer ?
//Todo add allow whitelist from ERC20 standard

/*
 * @title Basic token
 * @dev This ERC223 token is the most basic of them all ; the total amount of
    tokens are first created and stored in the contract's owner address.
 * @dev The total supply is created first ( it is capped ) and sent to different
    addresses during ICO
 */
contract abstractBasicToken{
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
     * @params an address representing target wallet
     * @return A uint256 representing an address balance
     */
    function balanceOf(address addr) public view returns(uint256);

    /*
     * @dev get total amount of tokens created
     * @return A uint256 representing the number oif tokens created.
     */
    function totalSupply() public view returns(uint256);

    /*
     * @dev get the tokens creator address
     * @return token creator's (owner) address
     */
    function getOwner() public returns(address);

    /*
     * @dev transfer function that is called when user or a contract wants to transfer tokens.
     * @params to is the address tokens are being transferred to
     * @params amount is the amount of tokens being transfered
     * @params data is of type bytes that represents the message being sent
     * @return A uint8 representing token's decimals
     */
    function transfer(address receiver, uint256 amount, bytes data) public returns(bool);

    /*
     * @dev transfer function that is called when user or a contract wants to transfer tokens.
     * @dev it is identical to ERC20 Standard's transfer function
     * @params to is the address tokens are being transferred to
     * @params amount is the amount of tokens being transfered
     * @return A uint8 representing token's decimals
     */
    function transfer(address receiver, uint256 amount) public returns(bool);

    /*
     * @dev this is the function that is called when tokens are being burnt
     * @params amount is of type uint 256 representingnumber of tokens being burnt
     * @return a boolean alue indication success or failure of the operation
     */
    function burn(uint256 amount) public returns(bool);

    //Events
    event TotalSupply(uint256 totalSupply);
    event BalanceOf(address addr, uint256 balance);
    event Burn(address indexed receiver, uint256 amount);
    event Transfer(address indexed sender, address indexed receiver, uint256 amount, bytes data);
    event GetOwner(address indexed owner);

}

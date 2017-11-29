pragma solidity ^0.4.17;
import "./token-interface.sol";
import "./erc223-basic.sol";
import "../libraries/SafeMath.sol";
import "../tokens/basic-token.sol";
//Todo : Add contract suicide
/*
 * @title CrowdSale
 * @dev The following is a basic boilerplate for any crowd sale.
 * @dev to create a crowd sale, extend this contract
 */
contract CrowdSale {
    using SafeMath for uint256;

    //State
    uint256 public _startTime;
    uint256 public _endTime;
    uint8 public _stage;
    address public _wallet;
    uint256 public _weiRaised;
    bool public isFinalized = false;
    
    /*
     * @dev this function returns the rate of how many tokens are given to cutomers per wei
     * @returns unit256 value that shows the current rate of tokens/wei
     */
    
    function getRate() public view returns(uint256);


    /*
     * @dev this function is invoked when someone sends ether to buy tokens
     * @params address receiver is wallet addressof the person who is contributing ethers to the crowdsale
     * @returns a boolean value indicating success or failure of this operation
     */
    function buyTokens(address receiver) public payable returns(bool);


    /*
     * @dev this function is called after the crowdsale is over to do actions
        that are required to be taken after the crowdsale is over.
     * @returns a boolean value indicating success or failure of this operation
     */
    function finalize() public returns(bool);


    /*
     * @dev constructor : it sets initial variables that is needed for any crowdsale
     * @dev it also checks to make sure some basic constraints are met.
     * @dev it has to be overwritten when this contract is being implemented by other contracts to create a crowdsale
     * @params uint256 startTime represents start time of the crowdsale
     * @params uint256 endTime represents when the CrowdSale ends
     * @params address wallet represents a wallet address in which all the funds are accumulated
     */
     
    function CrowdSale(uint256 startTime, uint256 endTime, address wallet) internal {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_wallet != 0x0);
        startTime = _startTime;
        endTime = _endTime;
        wallet = _wallet;
    }


    /*
     * @dev this function checks to make sure some basic constraints of a crowdsale is met
     * @returns a boolean value indicating success or failure of this operation
     */
     
    function validPurchase() internal view returns(bool) {
        require(_startTime <= now);
        require(_endTime >= now);
        require(!isFinalized);
        require(msg.value != 0);
        return true;

    }

    /*
     * @dev this function is called when the contract recieves ethers. it would call buyTokens() functon 
     */
    function() public payable {
        buyTokens(msg.sender);
    }

    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

}




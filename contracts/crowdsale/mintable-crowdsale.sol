pragma solidity ^0.4.17;
import "../abstract-classes/erc223-crowdsale.sol";
import "../tokens/mintable-token.sol";
import "../abstract-classes/erc223-receiver.sol";

contract mintableCrowdsale is CrowdSale {
    //State
    mintableToken public _token;
    
    //Constructor overrides Crowdsale constructor
    function mintableCrowdsale(uint256 startTime, uint256 endTime, address wallet, string symbol, string name, uint8 decimals) public CrowdSale(startTime, endTime, wallet) {
        _token = new mintableToken(symbol, name, decimals);
    }
    
    function getRate() public view returns(uint256) {
        require(validPurchase());

        if (_startTime <= now && now <= _endTime.sub(500)) {
            return 10;
        } else {
            return 5;
        }

    }

    //@dev Whitelist checks can be added to this function.
    function buyTokens(address receiver) public payable returns(bool) {
        require(receiver != 0x0);
        
        uint256 rate;
        rate = getRate();
        // Safty check : Make sure token/wei is not zero 
        require(rate != 0);
        
        //Get the amount of wei sent to the contract
        uint256 weiAmount = msg.value;
        //For tracking purposes, add the amount of weis recieved on this transaction to tatal amount of weis recieved
        _weiRaised = _weiRaised.add(weiAmount);
        
        //Find out how many tokens we are going to send to the user
        uint256 amount = weiAmount.mul(rate);
        //Mint the tokens.
        _token.mint(receiver, amount);
        //Use TokenPurchase event to log 
        TokenPurchase(msg.sender, receiver, weiAmount, amount);
        return true;
    }
    //Todo: Use Eager Evaluation - Use oraclize or Ethereum alarm clock to run finalize
    //@dev currently we are using Lazy evaluation
    function finalize() public returns(bool) {
        //Safety check : make sure the contracts owner is calling finalize function
        address owner = _token.getOwner();
        require(msg.sender == owner);
        //Safety Check : make sure the contact hasn't been finalized yet
        require(!isFinalized);
        //Safety Check : make sure current time is passed set end time of crowdsale
        require(now > _endTime);
        isFinalized = true;
        return true;
    }
}
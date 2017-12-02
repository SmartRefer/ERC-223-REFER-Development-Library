pragma solidity ^0.4.18;
import "../abstract-classes/erc223-crowdsale.sol";
import "../tokens/basic-token.sol";
import "../abstract-classes/erc223-receiver.sol";

contract basicCrowdsale is CrowdSale {
    //State
    basicToken public _token;

    //Constructor overrides Crowdsale constructor
    function basicCrowdsale(uint256 startTime, uint256 endTime, address wallet, string symbol, string name, uint8 decimals, uint256 totalSupply) public CrowdSale(startTime, endTime, wallet) {
        _token = new basicToken(symbol, name, decimals, totalSupply);
    }

    function getRate() public view returns(uint256) {
        if (_startTime <= now && now <= _endTime.sub(500)) {
            return 50;
        } else if (_endTime.sub(500) < now && now <= _endTime) {
            return 25;
        }
        // If it is not within startTime and endTime 
        else {
            return 0;
        }

    }

    //@dev Whitelist checks can be added to this function.
    function buyTokens(address receiver) public payable returns(bool) {
        validPurchase();
        if(receiver == 0x0)
        {
            revert();
        }
        else if(receiver == address(0))
        {
            revert();
        }
        // Safty check : Make sure token/wei is not zero 
        else if(getRate() == 0)
        {
            revert();
        }
        else
        {
            //Get the amount of wei sent to the contract
            //For tracking purposes, add the amount of weis recieved on this transaction to tatal amount of weis recieved
            uint256 rate = getRate();
            uint256 weiAmount = msg.value;
            _weiRaised = _weiRaised.add(weiAmount);
            
            //Transfer recieved ethers to our wallet
            _wallet.transfer(msg.value);
            
            //Find out how many tokens we are going to send to the user
            uint256 amount = weiAmount.mul(rate);

            // transfer tokens to the purson who is buying the tokens
            _token.transfer(receiver, amount);
            
            
            //Use TokenPurchase event to log 
            TokenPurchase(msg.sender, receiver, weiAmount, amount);
            return true;
        }

    }
    //Todo: Use Eager Evaluation - Use oraclize or Ethereum alarm clock to run finalize
    //@dev currently we are using Lazy evaluation
    function finalize() public returns(bool) {

        
        //Safety check : make sure the contracts owner is calling finalize function
        if (msg.sender != _owner) {
            revert();
        }
        //Safety Check : make sure the contact hasn't been finalized yet
        else if (isFinalized == true) {
            revert();
        }
        //Safety Check : make sure current time is passed set end time of crowdsale
        else if (now < _endTime) {
            revert();
        } else {
            //Finalize mechanism : if there are tokens remaining, burn them.
            uint256 remaining = _token.balanceOf(_token.getOwner());
            if (remaining > 0) {
                _token.burn(remaining);
            }
            isFinalized = true;
            Finalize (isFinalized , remaining);
            return true;
        }
    }


}
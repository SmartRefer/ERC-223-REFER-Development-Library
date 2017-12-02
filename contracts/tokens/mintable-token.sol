pragma solidity ^0.4.17;


import "../abstract-classes/erc223-mintable-token.sol";
import "../abstract-classes/erc223-receiver.sol";
import "./basic-token.sol";

contract mintableToken is abstractMintableToken {

    function mintableToken(string symbol, string name, uint8 decimals) public {
        _symbol = symbol;
        _name = name;
        _decimals = decimals;
        _owner = msg.sender;
        //set the initial total supply to zero
        _totalSupply = 0;

    }

    function getOwner() public returns(address) {
        GetOwner(_owner);
        return _owner;
    }

    function balanceOf(address addr) public view returns(uint256) {
        BalanceOf(addr, _balances[addr]);
        return _balances[addr];
    }

    function totalSupply() public view returns(uint256) {
        TotalSupply(_totalSupply);
        return _totalSupply;
    }

    function mint(address receiver, uint256 amount) public returns(bool) {
        // only owner can mint
        if(_owner != msg.sender)
        {
            revert();
        }

        //Cannot send the newly minted tokens to get burnt
        else if (receiver == 0x0)
        {
            revert();
        }
        else if(reciever == address(0))
        {
            revert();
        }
        else
        {
            //Question : Should it be empty ?
            bytes memory empty;
            _totalSupply = _totalSupply.add(amount);
            _balances[receiver] = _balances[receiver].add(amount);
            if (isContract(receiver)) {
                abstractReciever receiverContract = abstractReciever(receiver);
                receiverContract.tokenFallback(msg.sender, amount, data);
            }
            //Log event through calling Mint
            Mint(receiver, amount);
            return true;
        }
    }

    function transfer(address receiver, uint256 amount, bytes data) public returns(bool) {

        // Throw an error and fail if If balnce of sender is smaller than the amount of tokens sender has.
         // Throw an error and fail if If balnce of sender is smaller than the amount of tokens sender has.
        
        // Question : Should I make it larger than or equal ??
        if(balanceOf(msg.sender) < amount)
        {
            revert();
        }
        else if (receiver == 0x0)
        {
            revert();
        }
        else if(receiver==address(0))
        {
            revert();
        }
        
        else
        {
            //subtrack the amount of tokens from sender
            _balances[msg.sender] = _balances[msg.sender].sub(amount);
            //Add those tokens to reciever
            _balances[receiver] = _balances[receiver].add(amount);
    
            //If reciever is a contract ...
            if (isContract(receiver)) {
                abstractReciever receiverContract = abstractReciever(receiver);
                receiverContract.tokenFallback(msg.sender, amount, data);
    
            }
            Transfer(msg.sender, receiver, amount, data);
            return true;
        }
    }

    function transfer(address receiver, uint256 amount) public returns(bool) {
        bytes memory empty;
        //use ERC223 transfer function
        bool gotTransfered = transfer(receiver, amount, empty);

        if (gotTransfered)
            return true;
        else
            return false;
    }

    function burn(uint256 amount) public returns(bool) {
        //Safety check : amount of tokens being burned have to be larger than 0
        if (amount<=0)
        {
            revert();
        }
        //Safty check : token owner cannot burn more than the amount currently exists in their address
        else if(_balances[msg.sender] < amount)
        {
            revert();
        }
        else
        {
            //burn operation :
            _balances[msg.sender] = _balances[msg.sender].sub(amount);
            _totalSupply = _totalSupply.sub(amount);
            //Question : should i call Transfer event with address 0x0 instead ? 
            //Call Burn event to log
            Burn(msg.sender, amount);
            return true;
        }
    }

    //private functions
    function isContract(address addr) private view returns(bool) {
        uint length;
        assembly {
            //retrieve the size of the code on target address, this needs assembly
            length: = extcodesize(addr)
        }
        return (length > 0);
    }
}
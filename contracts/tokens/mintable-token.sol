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
        require(_owner == msg.sender);
        //Cannot send the newly minted tokens to get burnt
        require(receiver != 0x0);
        //Should not send the newly minted tokens to contracts
        //Question : Should it?
        require(!isContract(receiver));
        //Question : Should it be empty ?
        bytes memory empty;
        
        
        _totalSupply = _totalSupply.add(amount);
        _balances[receiver] = _balances[receiver].add(amount);
        //Log event through calling Mint
        Mint(receiver, amount);
        Transfer(msg.sender, receiver, amount, empty);
        return true;
    }

    function transfer(address receiver, uint256 amount, bytes data) public returns(bool) {

        // Throw an error and fail if If balnce of sender is smaller than the amount of tokens sender has.
        // Question : Should I make it larger than or equal ??
        require(balanceOf(msg.sender) > amount);
        require(receiver != 0x0);
        
        
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
        require(amount > 0);
        //Safty check : token owner cannot burn more than the amount currently exists in their address
        require(_balances[msg.sender] >= amount);
        
        //burn operation :
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _totalSupply = _totalSupply.sub(amount);
        //Question : should i call Transfer event with address 0x0 instead ? 
        //Call Burn event to log
        Burn(msg.sender, amount);
        return true;
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
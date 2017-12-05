pragma solidity ^ 0.4.18;
import "../abstract-classes/erc223-basic.sol";
import "../abstract-classes/erc223-receiver.sol";
//TODO test to see if contract owner can change the amount of total supply
contract basicToken is abstractBasicToken {
    function basicToken(string symbol, string name, uint8 decimals, uint256 totalSupply) public {
        _symbol = symbol;
        _name = name;
        _decimals = decimals;
        _owner = msg.sender;
        _balances[_owner] = totalSupply;
        _totalSupply = totalSupply;
    }
    function balanceOf(address addr) public view returns(uint256) {
        BalanceOf(addr, _balances[addr]);
        return _balances[addr];
    }
    function getOwner() public returns(address) {
        GetOwner(_owner);
        return _owner;
    }
    function totalSupply() public view returns(uint256) {
        TotalSupply(_totalSupply);
        return _totalSupply;
    }
    function transfer(address receiver, uint256 amount, bytes data) public returns(bool) {

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
                //Invoke the call back function on the reciever contract
                receiverContract.tokenFallback(msg.sender, amount, data);

            }
            //Call Transfer event to log.
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

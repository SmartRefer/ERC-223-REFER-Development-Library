pragma solidity ^0.4.18;
import "../interface/token-interface.sol";
import "../../receiver/receiver.sol";
import "../../libraries/SafeMath.sol";

contract mintable is tokenInterface {
  using SafeMath for uint256;
  string internal _symbol;
  string internal _name;
  uint8 internal _decimals;
  uint256 internal _totalSupply;
  address internal _owner;
  mapping(address => uint256) internal _balances;
    function mintable(string symbol, string name, uint8 decimals) public {
        _symbol = symbol;
        _name = name;
        _decimals = decimals;
        _owner = msg.sender;
        _totalSupply = 0;
    }
    function get_address() returns (address) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        return address(this);
      }
    }
    function getOwner() public returns(address) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        return _owner;
      }
    }

    function balanceOf(address addr) public view returns(uint256) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        return _balances[addr];
      }
    }

    function totalSupply() public view returns(uint256) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        return _totalSupply;
      }
    }

    function mint(address tokenAddress, address receiver, uint256 amount) public returns(bool) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else if(_owner != tokenAddress)
        {
            revert();
        }

        //Cannot send the newly minted tokens to get burnt
        else if (receiver == 0x0)
        {
            revert();
        }
        else if(receiver == address(0))
        {
            revert();
        }
        else
        {
            bytes memory empty;
            _totalSupply = _totalSupply.add(amount);
            _balances[receiver] = _balances[receiver].add(amount);
            if (isContract(receiver)) {
                Receiver Receiverontract = Receiver(receiver);
                Receiverontract.tokenFallback(tokenAddress, amount, empty);
            }
            return true;
        }
    }

    function transfer(address sender,address receiver, uint256 amount, bytes data) public returns(bool) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else if(balanceOf(sender) < amount)
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
            _balances[sender] = _balances[sender].sub(amount);
            //Add those tokens to reciever
            _balances[receiver] = _balances[receiver].add(amount);

            //If reciever is a contract ...
            if (isContract(receiver)) {
                Receiver Receiverontract = Receiver(receiver);
                Receiverontract.tokenFallback(sender, amount, data);
            }
            return true;
        }
    }

    function transfer(address sender,address receiver, uint256 amount) public returns(bool) {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        bytes memory empty;
        //use ERC223 transfer function
        bool gotTransfered = transfer(sender,receiver, amount, empty);

        if (gotTransfered)
        return true;
        else
        return false;
      }
    }

    function burn(address sender,uint256 amount) public returns(bool) {
        if(msg.sender!=_owner)
        {
          revert();
        }
        //Safety check : amount of tokens being burned have to be larger than 0
        else if (amount<=0)
        {
            revert();
        }
        //Safty check : token owner cannot burn more than the amount currently exists in their address
        else if(_balances[sender] < amount)
        {
            revert();
        }
        else
        {
            //burn operation :
            _balances[sender] = _balances[sender].sub(amount);
            _totalSupply = _totalSupply.sub(amount);
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

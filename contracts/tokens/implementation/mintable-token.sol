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
    function get_address() public onlyOwner returns (address) {
        return address(this);
    }
    function getOwner() public onlyOwner returns(address) {
        return _owner;
    }

    function balanceOf(address addr) public view onlyOwner returns(uint256) {
        return _balances[addr];
    }

    function totalSupply() public view onlyOwner returns(uint256) {
        return _totalSupply;
    }

    function mint(address tokenAddress, address receiver, uint256 amount) public onlyOwner returns(bool) {
      if(_owner != tokenAddress)
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

    function transfer(address sender,address receiver, uint256 amount, bytes data) public onlyOwner returns(bool) {
    if(balanceOf(sender) < amount)
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

    function transfer(address sender,address receiver, uint256 amount) public onlyOwner returns(bool) {

        bytes memory empty;
        //use ERC223 transfer function
        bool gotTransfered = transfer(sender,receiver, amount, empty);

        if (gotTransfered)
          return true;
        else
          return false;

    }

    function burn(address sender,uint256 amount) public onlyOwner returns(bool) {


        //Safty check : token owner cannot burn more than the amount currently exists in their address
       if(_balances[sender] < amount)
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
    modifier onlyOwner
    {
      if(msg.sender!=_owner)
      {
        revert();
      }
      else
      {
        _;
      }
    }
}

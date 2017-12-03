pragma solidity ^0.4.18;



import '../tokens/basic-token.sol';


// mock class using BasicToken
contract basicTokenMock is basicToken {
  function basicTokenMock(address ownerAddress, string symbol,
        string name, uint8 decimals,uint256 totalSupply) public basicToken(symbol,name,decimals,totalSupply) {
    _balances[ownerAddress] = totalSupply;
  }

}

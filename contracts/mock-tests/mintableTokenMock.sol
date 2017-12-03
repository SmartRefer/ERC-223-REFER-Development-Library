pragma solidity ^0.4.18;



import '../tokens/mintable-token.sol';


// mock class using BasicToken
contract mintableTokenMock is mintableToken {
  function mintableTokenMock(address ownerAddress, string symbol,
        string name, uint8 decimals) public mintableToken(symbol,name,decimals) {
    _owner = ownerAddress;
  }

}

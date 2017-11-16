pragma solidity ^0.4.17;

contract abstractReciever {
  function tokenFallback(address addr , uint value, bytes data) public returns (bool);
}

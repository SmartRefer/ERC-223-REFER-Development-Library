pragma solidity ^0.4.17;

interface Token {
  function balanceOf(address addr) public view returns (uint256);
  function totalSupply() public view returns (uint256);
  function transfer(address reciever, uint256 amount, bytes data) public returns (bool);
  function  transfer(address reciever, uint256 amount) public  returns (bool);
  function burn(uint256 amount) public returns (bool);
  function getOwner() public returns (address);

}

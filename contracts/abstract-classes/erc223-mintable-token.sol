pragma solidity ^0.4.17;
import "./token-interface.sol";
import "./erc223-basic.sol";
/*
 * @title Mintable token
 * @dev
 */
contract abstractMintableToken is Token , abstractBasicToken{

  function mint(address reciever, uint256 amount) public returns (bool);
  event Mint(address indexed reciever, uint256 amount);

}

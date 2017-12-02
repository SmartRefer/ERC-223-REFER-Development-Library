pragma solidity ^0.4.17;
import "./erc223-basic.sol";
/*
 * @title Mintable token
 * @dev The following is an example of mintable token. In this token, 
 * the total amount in circlation is not created initially. 
 * Tokens are minted as users purchase them during the crowdsale.
 */
contract abstractMintableToken is  abstractBasicToken {
    /*
     *@dev this is the function that mints Tokens. 
     *@dev This function does not know the ration of how many tokens get minted per wei.
     *since due to abstraction prinicples, it's the duty of crowdsale contract to pass the value to it
     *@dev this function should stop minting after crowd sale is over.
     *@params address receiver is the address of the person purchasing the tokens
     *@params uint256 amount is the amount of tokens being minted
     *@returns a boolean value indicating success or failure of this operation
     */
    function mint(address receiver, uint256 amount) public returns(bool);
    
    event Mint(address indexed receiver, uint256 amount);

}
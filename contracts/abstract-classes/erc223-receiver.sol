pragma solidity ^0.4.18;
/*@title Receiver contract Abstract Class
 *@dev this is an abstract class that is the building block of any contract that is supposed to recieve ERC223 token
 */
contract abstractReciever {
    //TODO : Might need to update signature ...
    
    /*
     *@dev this is the fallback function that is invoked when a contract recieves ERC223 tokens
     *@params address addr is the address that sends tokens to this contract
     *@params uint value is the number of tokens being sent to this contract
     *@params bytes data is the message that was sent to this contract
     *@returns
     */
    function tokenFallback(address addr, uint value, bytes data) public returns(bool);
}
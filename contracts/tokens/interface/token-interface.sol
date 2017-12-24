pragma solidity ^0.4.18;
interface tokenInterface{

    function balanceOf(address addr) public view returns(uint256);
    function totalSupply() public view returns(uint256);
    function getOwner() public returns(address);
    function transfer(address sender,address receiver, uint256 amount, bytes data) public returns(bool);
    function transfer(address sender,address receiver, uint256 amount) public returns(bool);
    function mint(address tokenAddress,address receiver, uint256 amount) public returns(bool);
    function burn(address owner,uint256 amount) public returns(bool);
    function get_address() returns (address) ;

}

'use strict';
const assertJump = require('./helpers/assertJump');

var basicTokenMock = artifacts.require("./test/basicTokenMock.sol");

contract('basicTokenMock', function(accounts) {
    let token;
    beforeEach(async function() {
    token = await basicTokenMock.new(accounts[0],"BST","Basic Token",18,500);
    });
    it("should return the correct totalSupply after construction", async function() {
      let totalSupply = await token.totalSupply();
      assert.equal(totalSupply, 500);
    });
    it("should return the correct balance of contract's owner after construction", async function() {
      let ownerBalance = await token.balanceOf(accounts[0])
      assert.equal(ownerBalance, 500);
    });

  it("should return correct balances after transfer (ERC 20 Standard for backward compateblity)", async function(){
    this.timeout(4500000);
    let transfer = await token.transfer(accounts[1], 200);
    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, 300);
    let secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(secondAccountBalance, 200);
  });
  it("should return currect owner balance after owner burning 100 tokens", async function() {
    await token.burn(100);
    let ownerBalance = await token.balanceOf(accounts[0])
    assert.equal(ownerBalance, 400);
  });
  it("should return currect total balance after owner burns 100 tokens", async function() {
    await token.burn(100);
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 400);
  });
  it("should burn tokens properly from different accounts", async function(){
    this.timeout(4500000);
    await token.transfer(accounts[1], 200);

    await token.burn(50, { from: accounts[0] })
    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, 250);

    await token.burn(50, { from: accounts[1] })
    let secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(secondAccountBalance, 150);


    const totalSupply = await token.totalSupply()
    assert.equal(totalSupply, 400);
  });
  //Test ERC 223 transfer
  /*
  it("should return correct balances after transfer", async function(){
    this.timeout(4500000);
    let token = await BasicTokenMock.new(accounts[0],"BST","Basic Token",18,500);
    let transfer = await token.transfer(accounts[1], 200 , "BST Transaction");
    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, 300);
    let secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(secondAccountBalance, 200);
  });
  */
  it('should throw an error when trying to transfer more than balance', async function() {
    try {
      // Question : Should I make it larger than or equal ??
      await token.transfer(accounts[1], 501);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it('should throw an error when trying to transfer to 0x0', async function() {
    try {
      await token.transfer(0x0, 100);
      assert.fail('should have thrown before');
    } catch(error) {
      await assertJump(error);
    }
  });
  it('should throw an error when trying to burn 0 or smaller amount of tokens', async function() {
    this.timeout(4500000);
    await token.transfer(accounts[1], 200);
    try {
      await token.burn(0, { from: accounts[1] })
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it('should throw an error when trying to burn more than owners balance', async function() {
    this.timeout(4500000);
    await token.transfer(accounts[1], 200);
    try {
      await token.burn(201, { from: accounts[1] })
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

});

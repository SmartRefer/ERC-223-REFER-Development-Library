'use strict';
const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const basicToken = artifacts.require("basicToken");
contract('basicTokenTest', function(accounts) {
    const token_owner = accounts[5];
    let token;
    beforeEach(async function() {
    token = await basicToken.new("BST","Basic Token",18,500,{from: token_owner});
    });

    describe('Utility Functions', function () {
      it("should return the correct totalSupply after construction", async function() {
        const totalSupply = await token.totalSupply();
        totalSupply.should.be.bignumber.equal(new BigNumber(500));
      });
      it("should return the correct balance of contract's owner after construction", async function() {
        const ownerBalance = await token.balanceOf(token_owner)
        ownerBalance.should.be.bignumber.equal(new BigNumber(500));
      });
    })

    describe('Main Token Functions', function () {
      it("should return correct balances after transfer (ERC 20 Standard for backward compateblity)", async function(){
        this.timeout(4500000);
        const transfer = await token.transfer(accounts[1], 200, {from:token_owner});
        const firstAccountBalance = await token.balanceOf(token_owner);
        const secondAccountBalance = await token.balanceOf(accounts[1]);
        firstAccountBalance.should.be.bignumber.equal(new BigNumber(300));
        secondAccountBalance.should.be.bignumber.equal(new BigNumber(200));
      });
      it("should return currect owner balance after owner burning 100 tokens", async function() {
        await token.burn(100,{from:token_owner});
        const ownerBalance = await token.balanceOf(token_owner)
        ownerBalance.should.be.bignumber.equal(new BigNumber(400));
      });
      it("should return currect total balance after owner burns 100 tokens", async function() {
        await token.burn(100,{from:token_owner});
        let totalSupply = await token.totalSupply();
        totalSupply.should.be.bignumber.equal(new BigNumber(400));
      });
      it("should burn tokens properly from different accounts", async function(){
        this.timeout(4500000);
        await token.transfer(accounts[1], 200,{from:token_owner});
        await token.burn(50, { from: accounts[1] })
        const firstAccountBalance = await token.balanceOf(accounts[1]);
        const totalSupply = await token.totalSupply()
        firstAccountBalance.should.be.bignumber.equal(new BigNumber(150));
        totalSupply.should.be.bignumber.equal(new BigNumber(450));
      });
    })

    describe('Tests that are supposed to fail', function () {
      it('should throw an error when trying to transfer more than balance', async function() {
        await token.transfer(accounts[1], 501,{ from: token_owner })
            .should.be.rejected
      });

      it('should throw an error when trying to transfer to 0x0', async function() {
          await token.transfer(0x0, 100,{ from: token_owner })
            .should.be.rejected

      });
      it('should throw an error when trying to burn 0 or smaller amount of tokens', async function() {
        this.timeout(4500000);
        await token.transfer(accounts[1], 200,{from:token_owner});
          await token.burn(0, { from: accounts[1] })
            .should.be.rejected

      });

      it('should throw an error when trying to burn more than owners balance', async function() {
        this.timeout(4500000);
        await token.transfer(accounts[1], 200,{from:token_owner});
        await token.burn(201, { from: accounts[1] })
            .should.be.rejected
      });
    })






});

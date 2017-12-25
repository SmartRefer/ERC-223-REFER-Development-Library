'use strict';
const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const TokenInstance = artifacts.require("token");
contract('tokenTest', function(accounts) {
    let token;
    let token_owner;

    describe('---! Basic Token !---', function () {
      beforeEach(async function() {
      token = await TokenInstance.new("BST","Basic Token",18,500);
      token_owner = await token.getChildOwner.call();
      });
      it("should return the correct totalSupply after construction", async function() {
          const totalSupply = await token.totalSupply();
          totalSupply.should.be.bignumber.equal(new BigNumber(500));
      });
      it("should return the correct balance of contract's owner after construction", async function() {
          const ownerBalance = await token.balanceOf(token_owner)
          ownerBalance.should.be.bignumber.equal(new BigNumber(500));
      });
      it("should return correct balances after transfer", async function(){
        this.timeout(4500000);
        await token.mint(accounts[1], 500);
        await token.transfer(accounts[2], 200,{from:accounts[1]});
        const firstAccountBalance = await token.balanceOf(accounts[1]);
        const secondAccountBalance = await token.balanceOf(accounts[2]);
        firstAccountBalance.should.be.bignumber.equal(new BigNumber(300));
        secondAccountBalance.should.be.bignumber.equal(new BigNumber(200));
      });
      it("should return currect owner balance after owner burning 100 tokens", async function() {
        await token.mint(accounts[1], 500);
        await token.burn(100,{from:accounts[1]});
        const ownerBalance = await token.balanceOf(accounts[1])
        ownerBalance.should.be.bignumber.equal(new BigNumber(400));
      });
      it("should return currect total balance after owner burns 100 tokens", async function() {
        await token.mint(accounts[1], 500);
        await token.burn(100,{from:accounts[1]});
        let totalSupply = await token.totalSupply();
        totalSupply.should.be.bignumber.equal(new BigNumber(400));
      });
      it('should throw an error when trying to transfer more than balance', async function() {
        await token.mint(accounts[1], 500);
        await token.transfer(accounts[2], 501,{ from: accounts[1] })
            .should.be.rejected
      });

      it('should throw an error when trying to transfer to 0x0', async function() {
        await token.mint(accounts[1], 500);
          await token.transfer(0x0, 100,{ from: accounts[1]  })
            .should.be.rejected

      });

      it('should throw an error when trying to burn more than owners balance', async function() {
        this.timeout(4500000);
        await token.mint(accounts[1], 200);
        await token.burn(201, { from: accounts[1] })
            .should.be.rejected
      });
    })
    describe('---! Mintable Token !---', function () {
      beforeEach(async function() {
      token = await TokenInstance.new("MNT","Mintable Token",18,0);
      token_owner = await token.getChildOwner.call();
      });
      it("should return the correct totalSupply after construction", async function() {

          const totalSupply = await token.totalSupply();
          totalSupply.should.be.bignumber.equal(new BigNumber(0));
      });
      it("should return the correct balance of contract's owner after construction", async function() {
          const ownerBalance = await token.balanceOf(token_owner)
          ownerBalance.should.be.bignumber.equal(new BigNumber(0));
      });

      it("should mint 100 tokens and send it to account[2]", async function() {
        const result = await token.mint(accounts[2], 100);
        result.logs[0].event.should.be.equal("Mint");
        result.logs[0].args.receiver.valueOf().should.be.equal(accounts[2]);
        result.logs[0].args.amount.valueOf().should.be.bignumber.equal(new BigNumber(100));
        const TokenOwnerBalance = await token.balanceOf(token_owner);
        TokenOwnerBalance.should.be.bignumber.equal(new BigNumber(0));
        const RecieverBlance = await token.balanceOf(accounts[2]);
        RecieverBlance.should.be.bignumber.equal(new BigNumber(100));
        const totalSupply = await token.totalSupply();
        totalSupply.should.be.bignumber.equal(new BigNumber(100));
      });
      it("should burn tokens properly from different accounts", async function(){
        this.timeout(4500000);
        await token.mint(accounts[0], 300);
        await token.mint(accounts[1], 200);

        await token.burn(50, { from: accounts[0] })
        const firstAccountBalance = await token.balanceOf(accounts[0]);
        firstAccountBalance.should.be.bignumber.equal(new BigNumber(250));

        await token.burn(50, { from: accounts[1] })
        const secondAccountBalance = await token.balanceOf(accounts[1]);
        secondAccountBalance.should.be.bignumber.equal(new BigNumber(150));

        const totalSupply = await token.totalSupply()
        totalSupply.should.be.bignumber.equal(new BigNumber(400));

      });

      it("should return correct balances after transfer", async function(){
          this.timeout(4500000);
          await token.mint(accounts[0], 500);
          const transfer = await token.transfer(accounts[1], 200,{from: accounts[0]});
          const firstAccountBalance = await token.balanceOf(accounts[0]);
          firstAccountBalance.should.be.bignumber.equal(new BigNumber(300));
          const secondAccountBalance = await token.balanceOf(accounts[1]);
          secondAccountBalance.should.be.bignumber.equal(new BigNumber(200));
        });
        it('should throw an error when calling mint from an address that is not owner', async function() {
          await token.mint(accounts[0], 500,{from:accounts[1]})
            .should.be.rejected
        });
        it('should throw an error when trying to transfer more than balance', async function() {
          await token.mint(accounts[0], 500);
          await token.transfer(accounts[1], 501,{from:accounts[1]})
              .should.be.rejected

        });

        it('should throw an error when trying to transfer to 0x0', async function() {
          await token.mint(accounts[0], 500);
          await token.transfer(0x0, 100,{from:accounts[1]})
            .should.be.rejected
        });


        it('should throw an error when trying to burn more than owners balance', async function() {
          this.timeout(4500000);
          await token.mint(accounts[1], 200);
          await token.burn(201, { from: accounts[1] })
              .should.be.rejected
        });
    })

});

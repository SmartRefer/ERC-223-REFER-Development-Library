
// 'use strict';
//
// const assertJump = require('./helpers/assertJump');
// var mintableTokenMock = artifacts.require("mintableTokenMock");
const BigNumber = web3.BigNumber
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const mintableToken = artifacts.require("mintableToken");

contract('mintableTokenTest', function(accounts) {
  let token
  const token_owner = accounts[5];

  beforeEach(async function() {
     token = await mintableToken.new("MNT","Mintable Token",18,{from: token_owner});
  });
  it("should return the correct totalSupply after construction", async function() {
    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(new BigNumber(0));
  });

    it("should mint 100 tokens and send it to account[2]", async function() {
      const result = await token.mint(accounts[2], 100,{from: token_owner});
      const owner = await token.getOwner();
      const ownerAddress = owner.logs[0].args.owner.valueOf()
      const ownerBalance = await token.balanceOf(token_owner)

      result.logs[0].event.should.be.equal("Mint");
      result.logs[0].args.receiver.valueOf().should.be.equal(accounts[2]);
      result.logs[0].args.amount.valueOf().should.be.bignumber.equal(new BigNumber(100));

      const TokenOwnerBalance = await token.balanceOf(ownerAddress);
      TokenOwnerBalance.should.be.bignumber.equal(new BigNumber(0));
      const RecieverBlance = await token.balanceOf(accounts[2]);
      RecieverBlance.should.be.bignumber.equal(new BigNumber(100));
      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(new BigNumber(100));
    });

    it("should return correct balances after transfer (ERC 20 Standard for backward compateblity)", async function(){
        this.timeout(4500000);
        await token.mint(accounts[0], 500,{from: token_owner});
        const transfer = await token.transfer(accounts[1], 200,{from: accounts[0]});
        const firstAccountBalance = await token.balanceOf(accounts[0]);
        firstAccountBalance.should.be.bignumber.equal(new BigNumber(300));
        const secondAccountBalance = await token.balanceOf(accounts[1]);
        secondAccountBalance.should.be.bignumber.equal(new BigNumber(200));
      });

      it("should return currect total balance after owner burns 100 tokens", async function() {
        await token.mint(accounts[0], 500,{from: token_owner});
        await token.burn(100);
        const totalSupply = await token.totalSupply();
        totalSupply.should.be.bignumber.equal(new BigNumber(400));
      });
      it("should burn tokens properly from different accounts", async function(){
        this.timeout(4500000);
        await token.mint(accounts[0], 300,{from: token_owner});
        await token.mint(accounts[1], 200,{from: token_owner});

        await token.burn(50, { from: accounts[0] })
        const firstAccountBalance = await token.balanceOf(accounts[0]);
        firstAccountBalance.should.be.bignumber.equal(new BigNumber(250));

        await token.burn(50, { from: accounts[1] })
        const secondAccountBalance = await token.balanceOf(accounts[1]);
        secondAccountBalance.should.be.bignumber.equal(new BigNumber(150));

        const totalSupply = await token.totalSupply()
        totalSupply.should.be.bignumber.equal(new BigNumber(400));

      });
      //Test ERC 223 transfer
    //   /*
    //   it("should return correct balances after transfer", async function(){
    //     this.timeout(4500000);
    //     let token = await mintableTokenMock.new(accounts[0],"MNT","Mintable Token",18);
    //     let transfer = await token.transfer(accounts[1], 200 , "MNT Transaction");
    //     let firstAccountBalance = await token.balanceOf(accounts[0]);
    //     assert.equal(firstAccountBalance, 300);
    //     let secondAccountBalance = await token.balanceOf(accounts[1]);
    //     assert.equal(secondAccountBalance, 200);
    //   });
    //   */
      it('should throw an error when trying to transfer more than balance', async function() {
        await token.mint(accounts[0], 500,{from:token_owner});
        await token.transfer(accounts[1], 501,{from:accounts[1]})
            .should.be.rejectedWith('invalid opcode')

      });

      it('should throw an error when trying to transfer to 0x0', async function() {
        await token.mint(accounts[0], 500,{from:token_owner});
        await token.transfer(0x0, 100,{from:accounts[1]})
          .should.be.rejectedWith('invalid opcode')
      });
      it('should throw an error when trying to burn 0 or smaller amount of tokens', async function() {
        this.timeout(4500000);
        await token.mint(accounts[1], 200,{from:token_owner});
        await token.burn(0, { from: accounts[1] })
          .should.be.rejectedWith('invalid opcode')
      });

      it('should throw an error when trying to burn more than owners balance', async function() {
        this.timeout(4500000);
        await token.mint(accounts[1], 200,{from:token_owner});
        await token.burn(201, { from: accounts[1] })
            .should.be.rejectedWith('invalid opcode')
      });
});


'use strict';

const assertJump = require('./helpers/assertJump');

var mintableTokenMock = artifacts.require("./test/mintableTokenMock.sol");

contract('mintableTokenMock', function(accounts) {
  let token
  beforeEach(async function() {
     token = await mintableTokenMock.new(accounts[0],"MNT","Mintable Token",18);
  });
    it("should start with a totalSupply of 0", async function() {
      let totalSupply = await token.totalSupply();
      assert.equal(totalSupply, 0);
    });

    it("should mint 100 tokens and send it to account[2]", async function() {
      const result = await token.mint(accounts[2], 100);
      const owner = await token.getOwner();
      const ownerAddress = owner.logs[0].args.owner.valueOf()

      assert.equal(result.logs[0].event, 'Mint');
      assert.equal(result.logs[0].args.reciever.valueOf(), accounts[2]);
      assert.equal(result.logs[0].args.amount.valueOf(), 100);
      assert.equal(result.logs[1].event, 'Transfer');
      assert.equal(result.logs[1].args.sender.valueOf(), ownerAddress);
      let balance0 = await token.balanceOf(accounts[0]);
      assert(balance0, 0);

      let balance2 = await token.balanceOf(accounts[2]);
      assert(balance0, 100);

      let totalSupply = await token.totalSupply();
      assert(totalSupply, 100);
    });
    it("should mint 200 tokens and send it to account[1]", async function() {
      const result = await token.mint(accounts[1], 200);
      const owner = await token.getOwner();
      const ownerAddress = owner.logs[0].args.owner.valueOf()

      assert.equal(result.logs[0].event, 'Mint');
      assert.equal(result.logs[0].args.reciever.valueOf(), accounts[1]);
      assert.equal(result.logs[0].args.amount.valueOf(), 200);
      assert.equal(result.logs[1].event, 'Transfer');
      assert.equal(result.logs[1].args.sender.valueOf(), ownerAddress);
      let balance0 = await token.balanceOf(accounts[0]);
      assert(balance0, 0);

      let balance1 = await token.balanceOf(accounts[2]);
      assert(balance0, 100);

      let balance2 = await token.balanceOf(accounts[2]);
      assert(balance0, 100);

      let totalSupply = await token.totalSupply();
      assert(totalSupply, 300);
    });
    it("should return correct balances after transfer (ERC 20 Standard for backward compateblity)", async function(){
        this.timeout(4500000);
        await token.mint(accounts[0], 500);
        let transfer = await token.transfer(accounts[1], 200);
        let firstAccountBalance = await token.balanceOf(accounts[0]);
        assert.equal(firstAccountBalance, 300);
        let secondAccountBalance = await token.balanceOf(accounts[1]);
        assert.equal(secondAccountBalance, 200);
      });

      it("should return currect total balance after owner burns 100 tokens", async function() {
        await token.mint(accounts[0], 500);
        await token.burn(100);
        let totalSupply = await token.totalSupply();
        assert.equal(totalSupply, 400);
      });
      it("should burn tokens properly from different accounts", async function(){
        this.timeout(4500000);
        await token.mint(accounts[0], 300);
        await token.mint(accounts[1], 200);

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
        let token = await mintableTokenMock.new(accounts[0],"MNT","Mintable Token",18);
        let transfer = await token.transfer(accounts[1], 200 , "MNT Transaction");
        let firstAccountBalance = await token.balanceOf(accounts[0]);
        assert.equal(firstAccountBalance, 300);
        let secondAccountBalance = await token.balanceOf(accounts[1]);
        assert.equal(secondAccountBalance, 200);
      });
      */
      it('should throw an error when trying to transfer more than balance', async function() {
        await token.mint(accounts[0], 500);

        try {
          await token.transfer(accounts[1], 501);
          assert.fail('should have thrown before');
        } catch(error) {
          assertJump(error);
        }
      });

      it('should throw an error when trying to transfer to 0x0', async function() {
        await token.mint(accounts[0], 500);
        try {
          await token.transfer(0x0, 100);
          assert.fail('should have thrown before');
        } catch(error) {
          assertJump(error);
        }
      });
      it('should throw an error when trying to burn 0 or smaller amount of tokens', async function() {
        this.timeout(4500000);
        await token.mint(accounts[1], 200);
        try {
          await token.burn(0, { from: accounts[1] })
          assert.fail('should have thrown before');
        } catch(error) {
          assertJump(error);
        }
      });

      it('should throw an error when trying to burn more than owners balance', async function() {
        this.timeout(4500000);
        await token.mint(accounts[1], 200);
        try {
          this.timeout(4500000);
          await token.burn(201, { from: accounts[1] })
          assert.fail('should have thrown before');
        } catch(error) {
          assertJump(error);
        }
      });
});

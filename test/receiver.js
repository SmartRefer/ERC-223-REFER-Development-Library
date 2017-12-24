'use strict';
const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const TokenInstance = artifacts.require("token");
const RecieverInstance = artifacts.require("Receiver");

contract('receiverTest', function(accounts) {
    let token;
    let wrong_token;
    let receiver;

    const token_owner = accounts[1];
    let token_Address;
    let wrong_token_Address;
    let receiver_address;
    describe('---! Simple Receiver Tests !---', function () {
      beforeEach(async function() {
      this.timeout(4500000);
      token = await TokenInstance.new("BST","Basic Token",18,500);
      wrong_token = await TokenInstance.new("DBST","DifferentBasic Token",18,500);
      receiver = await RecieverInstance.new();
      await token.mint(token_owner, 500);
      await wrong_token.mint(token_owner, 500);
      token_Address = await token.get_address.call();
      wrong_token_Address=await wrong_token.get_address.call();
      receiver_address = receiver.address;

      });

      it("should Whitelist token address without an issue", async function(){
        const {logs} = await receiver.whitelist(token_Address);
        const whitelist_event =  logs.find(e => e.event === 'Whitelist')
        should.exist(whitelist_event);
        whitelist_event.args.token.should.equal(token_Address);
      });
      it("should accept token address after whitelisting without an issue", async function(){
        await receiver.whitelist(token_Address);
        await token.transfer(receiver_address,200,{from:token_owner})
        const sender_balance = await token.balanceOf(token_owner);
        const receiver_balance = await token.balanceOf(receiver_address);
        sender_balance.should.be.bignumber.equal(new BigNumber(300));
        receiver_balance.should.be.bignumber.equal(new BigNumber(200));
      });

      it('should throw an error when trying to transfer tokens that is not whitelisted', async function() {
        await receiver.whitelist(token_Address);
        await wrong_token.transfer(receiver_address, 300,{ from: token_owner })
            .should.be.rejected
      });


    })

});

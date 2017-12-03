import {
    ether,
    advanceBlock,
    latestTime,
    duration,
    increaseTimeTo
} from './helpers/crowdsale-helper'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const mintableToken = artifacts.require("mintableToken");
const mintableCrowdsale = artifacts.require("mintableCrowdsale");

contract('mintableCrowdsaleTest', function(accounts) {
    const contract_owner = accounts[5];
    const reciever_wallet = accounts[1];
    const purchaser = accounts[2];
    const sponsor = accounts[3];
    const value = ether(2);
    let _mintableCrowdsale;
    let _mintableToken;
    let _startTime;
    let _endTime;
    let _afterEndTime;
    before(async function() {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    })

    beforeEach(async function() {
        // We are adding one week to test for payment rejection before crowdsale starts
        _startTime = latestTime() + duration.weeks(1);
        _endTime = _startTime + duration.weeks(1);
        _afterEndTime = _endTime + duration.seconds(1)
        _mintableCrowdsale = await mintableCrowdsale.new(
            _startTime,
            _endTime,
            reciever_wallet,
            "MNT","Mintable Token", 18,

            {from: contract_owner})
        _mintableToken = mintableToken.at(await _mintableCrowdsale._token())
    })
    it("Accounts[5] should be crowdsale owner", async function() {

        const ownerAddress = await _mintableCrowdsale._owner()
        ownerAddress.should.equal(contract_owner)

    })
    it('should be token owner', async function() {
        const owner = await _mintableToken.getOwner()
        const ownerAddress = owner.logs[0].args.owner.valueOf()
        ownerAddress.should.equal(_mintableCrowdsale.address)

    })
    it('Initally should have a total supply of zero', async function () {

      const totalSupply = await _mintableToken.totalSupply()
      totalSupply.should.be.bignumber.equal(new BigNumber(0))
    })
    it('should reject payments before start - contract fallback function', async function ()
      {

        await _mintableCrowdsale.send(value)
        .should.be.rejectedWith('invalid opcode')

      })

    it('should reject payments before start - buyTokens()', async function ()
      {

        await _mintableCrowdsale.buyTokens(purchaser, {from: sponsor, value: value})
        .should.be.rejectedWith('invalid opcode')
      })



    it('should accept payments after start - contract fallback function', async function() {
        await increaseTimeTo(_startTime)
        await _mintableCrowdsale.send(value).should.be.fulfilled
    })
    it('should accept payments after start - buyTokens()', async function() {
        await increaseTimeTo(_startTime)
        await _mintableCrowdsale.buyTokens(purchaser, {
            value: value,
            from: sponsor
        }).should.be.fulfilled
    })

    it('should reject payments after end - contract fallback function', async function () {
      await increaseTimeTo(_afterEndTime)
      await _mintableCrowdsale.send(value).should.be.rejectedWith('invalid opcode')
    })
    it('should reject payments after end - buyTokens()', async function () {
      await increaseTimeTo(_afterEndTime)
      await _mintableCrowdsale.buyTokens(purchaser,
                                    {value: value, from: sponsor})
                          .should.be.rejectedWith('invalid opcode')
    })
    it('should log purchase - contract fallback function', async function () {
      await increaseTimeTo(_startTime)
      const {logs} =  await _mintableCrowdsale.send(value)
      const ReturnTokensAmount = new BigNumber(value*50);
      const event = logs.find(e => e.event === 'TokenPurchase')
      should.exist(event)
      event.args.purchaser.should.equal(accounts[0])
      event.args.beneficiary.should.equal(accounts[0])
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(ReturnTokensAmount)
    })
    it('should log purchase - buyTokens()', async function () {
      await increaseTimeTo(_startTime)
      const {logs} = await _mintableCrowdsale.buyTokens(purchaser,{value: value, from: purchaser})
      const ReturnTokensAmount = new BigNumber(value*50);
      const event = logs.find(e => e.event === 'TokenPurchase')
      should.exist(event)
      event.args.purchaser.should.equal(purchaser)
      event.args.beneficiary.should.equal(purchaser)
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(ReturnTokensAmount)
    })

    it('should transfer tokens to buyer -contract fallback function ', async function () {
      await increaseTimeTo(_startTime)
      await _mintableCrowdsale.send(value)
      let balance = await _mintableToken.balanceOf(accounts[0]);
      const ReturnTokensAmount = new BigNumber(value*50);
      balance.should.be.bignumber.equal(ReturnTokensAmount)
    })
    it('should transfer tokens to buyer -buyTokens() ', async function () {
      await increaseTimeTo(_startTime)
      await await _mintableCrowdsale.buyTokens(purchaser,{value: value, from: purchaser})
      let balance = await _mintableToken.balanceOf(purchaser);
      const ReturnTokensAmount = new BigNumber(value*50);
      balance.should.be.bignumber.equal(ReturnTokensAmount)
    })
    it('should store recieved ethers in the wallet', async function () {
      await increaseTimeTo(_startTime)
      const pre =  web3.eth.getBalance(accounts[1]);
      await _mintableCrowdsale.send(value)
      const post = web3.eth.getBalance(accounts[1]);
      post.minus(pre).should.be.bignumber.equal(value);
    })
    it('currectly increase the total tokens in circulation after sale ', async function () {
      await increaseTimeTo(_startTime)
    //   const owner = await _mintableToken.getOwner()
    //   const ownerAddress = owner.logs[0].args.owner.valueOf()
      const InitialTotalSupply = new BigNumber((await _mintableToken.totalSupply()))
      await _mintableCrowdsale.send(value)
      const TotalSupplyAfterTransfer = new BigNumber((await _mintableToken.totalSupply()))
      const ReturnTokensAmount = new BigNumber(value*50);
      TotalSupplyAfterTransfer.minus(InitialTotalSupply).should.be.bignumber.equal(ReturnTokensAmount);
    })
    it('should have the current amount of tokens in buyers address after sale ', async function () {

      await increaseTimeTo(_startTime)
      const InitialOwnerBalance = new BigNumber((await _mintableToken.balanceOf(accounts[0])))
      await _mintableCrowdsale.send(value)
      const OwnerBalanceAfterTransfer = new BigNumber((await _mintableToken.balanceOf(accounts[0])))
      const ReturnTokensAmount = new BigNumber(value*50);
      OwnerBalanceAfterTransfer.minus(InitialOwnerBalance).should.be.bignumber.equal(ReturnTokensAmount);
    })

    describe('After crowdsale is over', function () {
      let owner;
      let ownerAddress ;
      let InitialOwnerBalance ;
      let OwnerBalanceAfterTransfer;
      let RecieverOneBalance;
      let RecieverTwoBalance;
      beforeEach(async function(){
        owner = await _mintableToken.getOwner()
        ownerAddress = owner.logs[0].args.owner.valueOf()
        await increaseTimeTo(_startTime)
        await _mintableCrowdsale.sendTransaction({from:accounts[6], to:_mintableCrowdsale.address, value: value})
        await _mintableCrowdsale.sendTransaction({from:accounts[7], to:_mintableCrowdsale.address, value: 2*value})
        OwnerBalanceAfterTransfer = new BigNumber(await _mintableToken.balanceOf(ownerAddress))
        await increaseTimeTo(_afterEndTime)
      });
      it('should emit currect Events ', async function () {
        let {logs} = await _mintableCrowdsale.finalize({from:contract_owner})
        const finalized  = await _mintableCrowdsale.isFinalized();
        InitialOwnerBalance = new BigNumber(await _mintableToken.balanceOf(ownerAddress))
        const FinalOwnerBalance = new BigNumber(await _mintableToken.balanceOf(ownerAddress))
        const event = logs.find(e => e.event === 'Finalize')
        should.exist(event)
        event.args.finalized.should.equal(finalized)
        event.args.burned.should.be.bignumber.equal(OwnerBalanceAfterTransfer)
      })

      it('should not accept any more ethers ', async function () {
        await _mintableCrowdsale.finalize({from:contract_owner})
           await _mintableCrowdsale.buyTokens(purchaser,{value: value, from: purchaser})
           .should.be.rejected
           await _mintableCrowdsale.sendTransaction({from:accounts[8], to:_mintableCrowdsale.address, value: value})
            .should.be.rejected;
      })
      it('token owner (crowdsale contract) should have 0 tokens ', async function () {
        await _mintableCrowdsale.finalize({from:contract_owner})
        const FinalOwnerBalance = new BigNumber(await _mintableToken.balanceOf(ownerAddress))
        FinalOwnerBalance.should.be.bignumber.equal(new BigNumber(0));
      })

      it('Accounts[6] and Accounts[7] should have the currect balance ', async function () {
        await _mintableCrowdsale.finalize({from:contract_owner})
        const FinalRecieverOneBalance  = new BigNumber(await _mintableToken.balanceOf(accounts[6]));
        const FinalRecieverTwoBalance = new BigNumber(await _mintableToken.balanceOf(accounts[7]));
        FinalRecieverOneBalance.should.be.bignumber.equal(new BigNumber(value*50));
        FinalRecieverTwoBalance.should.be.bignumber.equal(new BigNumber(2*value*50));
      })
      it('should show the current total number of tokens in circulation',async function(){
        await _mintableCrowdsale.finalize({from:contract_owner})
        const ReturnTokensAmount = new BigNumber(3*value*50);
        const totalSupply = await _mintableToken.totalSupply();
        totalSupply.should.be.bignumber.equal(ReturnTokensAmount);
      })
      it('Tokens should transfer without an issues after finalise() function ', async function () {
      await _mintableCrowdsale.finalize({from:contract_owner})
       await _mintableToken.transfer(accounts[8],50, {from:accounts[7]});
        const firstAccountBalance = await _mintableToken.balanceOf(accounts[7]);
        const secondAccountBalance = await _mintableToken.balanceOf(accounts[8]);
        assert(secondAccountBalance,50)
        assert(firstAccountBalance,199999999999999999950)
      })
      it('Should fails when transfering from an acount that does not have any tokens ', async function () {
      await _mintableCrowdsale.finalize({from:contract_owner})
          await _mintableToken.transfer(accounts[6],50, {from:accounts[9]})
             .should.be.rejected;
      })
    })


})

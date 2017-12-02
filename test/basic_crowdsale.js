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
const basicToken = artifacts.require("basicToken");
const basicCrowdsale = artifacts.require("basicCrowdsale");

contract('basicCrowdsaleTest', function(accounts) {
    const contract_owner = accounts[5];
    const reciever_wallet = accounts[1];
    const purchaser = accounts[2];
    const sponsor = accounts[3];
    const value = ether(2);
    const _totalSupply = 20000000000000000000000000000;
    let _basicCrowdsale;
    let _basicToken;
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
        _basicCrowdsale = await basicCrowdsale.new(
            _startTime,
            _endTime,
            reciever_wallet,
            "BST", "Basic Token", 18,
            _totalSupply,
            {from: contract_owner})
        _basicToken = basicToken.at(await _basicCrowdsale._token())
    })
    it("Accounts[5] should be crowdsale owner", async function() {
      
        const ownerAddress = await _basicCrowdsale._owner()
        ownerAddress.should.equal(contract_owner)
    
    })
    it('should be token owner', async function() {
        const owner = await _basicToken.getOwner()
        const ownerAddress = owner.logs[0].args.owner.valueOf()
        ownerAddress.should.equal(_basicCrowdsale.address)
    
    })
    it('should have a fixed total supply defined when crowdsale is ceated', async function () {
    
      const totalSupply = await _basicToken.totalSupply()
      totalSupply.should.be.bignumber.equal(_totalSupply)
    })
    it('should reject payments before start - contract fallback function', async function () 
      {

        await _basicCrowdsale.send(value)
        .should.be.rejectedWith('invalid opcode')

      })

    it('should reject payments before start - buyTokens()', async function () 
      {

        await _basicCrowdsale.buyTokens(purchaser, {from: sponsor, value: value})
        .should.be.rejectedWith('invalid opcode')
      })



    it('should accept payments after start - contract fallback function', async function() {
        await increaseTimeTo(_startTime)
        await _basicCrowdsale.send(value).should.be.fulfilled
    })
    it('should accept payments after start - buyTokens()', async function() {
        await increaseTimeTo(_startTime)
        await _basicCrowdsale.buyTokens(purchaser, {
            value: value,
            from: sponsor
        }).should.be.fulfilled
    })

    it('should reject payments after end - contract fallback function', async function () {
      await increaseTimeTo(_afterEndTime)
      await _basicCrowdsale.send(value).should.be.rejectedWith('invalid opcode')
    })
    it('should reject payments after end - buyTokens()', async function () {
      await increaseTimeTo(_afterEndTime)
      await _basicCrowdsale.buyTokens(purchaser,
                                    {value: value, from: sponsor})
                          .should.be.rejectedWith('invalid opcode')
    })
    it('should log purchase - contract fallback function', async function () {
      await increaseTimeTo(_startTime)
      const {logs} =  await _basicCrowdsale.send(value)
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
      const {logs} = await _basicCrowdsale.buyTokens(purchaser,{value: value, from: purchaser})
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
      await _basicCrowdsale.send(value)
      let balance = await _basicToken.balanceOf(accounts[0]);
      const ReturnTokensAmount = new BigNumber(value*50);
      balance.should.be.bignumber.equal(ReturnTokensAmount)
    })
    it('should transfer tokens to buyer -buyTokens() ', async function () {
      await increaseTimeTo(_startTime)
      await await _basicCrowdsale.buyTokens(purchaser,{value: value, from: purchaser})
      let balance = await _basicToken.balanceOf(purchaser);
      const ReturnTokensAmount = new BigNumber(value*50);
      balance.should.be.bignumber.equal(ReturnTokensAmount)
    })
    it('should store recieved ethers in the wallet', async function () {
      await increaseTimeTo(_startTime)
      const pre =  web3.eth.getBalance(accounts[1]);
      await _basicCrowdsale.send(value)
      const post = web3.eth.getBalance(accounts[1]);
      post.minus(pre).should.be.bignumber.equal(value);
    })
    it('should have the current amount of tokens in owners contract after sale ', async function () {
      await increaseTimeTo(_startTime)
      const owner = await _basicToken.getOwner()
      const ownerAddress = owner.logs[0].args.owner.valueOf()
      const InitialOwnerBalance = new BigNumber((await _basicToken.balanceOf(ownerAddress)))
      await _basicCrowdsale.send(value)
      const OwnerBalanceAfterTransfer = new BigNumber((await _basicToken.balanceOf(ownerAddress)).valueOf())
      const ReturnTokensAmount = new BigNumber(value*50);
      InitialOwnerBalance.minus(OwnerBalanceAfterTransfer).should.be.bignumber.equal(ReturnTokensAmount);
    })
    it('should have the current amount of tokens in buyers address after sale ', async function () {
      await increaseTimeTo(_startTime)
      const InitialOwnerBalance = new BigNumber((await _basicToken.balanceOf(accounts[0])))
      await _basicCrowdsale.send(value)
      const OwnerBalanceAfterTransfer = new BigNumber((await _basicToken.balanceOf(accounts[0])).valueOf())
      const ReturnTokensAmount = new BigNumber(value*50);
      OwnerBalanceAfterTransfer.minus(InitialOwnerBalance).should.be.bignumber.equal(ReturnTokensAmount);
    })
    it('should perform finalise function properly ', async function () {
      const owner = await _basicToken.getOwner()
      const ownerAddress = owner.logs[0].args.owner.valueOf()
      const InitialOwnerBalance = new BigNumber(await _basicToken.balanceOf(ownerAddress))

      await increaseTimeTo(_startTime)
      await _basicCrowdsale.send(value)
      const OwnerBalanceAfterTransfer = new BigNumber(await _basicToken.balanceOf(ownerAddress))
      const InitialRecieverBalance = new BigNumber(await _basicToken.balanceOf(accounts[0]))

      await increaseTimeTo(_afterEndTime)
      
       const {logs} = await _basicCrowdsale.finalize({from:contract_owner})
      const finalized  = await _basicCrowdsale.isFinalized();
      const FinalOwnerBalance = new BigNumber(await _basicToken.balanceOf(ownerAddress))
      const FinalRecieverBalance = new BigNumber(await _basicToken.balanceOf(accounts[0]))

      const event = logs.find(e => e.event === 'Finalize')
      should.exist(event)
      event.args.finalized.should.equal(finalized)
      event.args.burned.should.be.bignumber.equal(OwnerBalanceAfterTransfer)
      FinalOwnerBalance.should.be.bignumber.equal(new BigNumber(0));
      FinalRecieverBalance.should.be.bignumber.equal(InitialRecieverBalance);
    })
    
})

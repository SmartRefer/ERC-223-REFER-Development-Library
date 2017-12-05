import {
    ether,
    advanceBlock,
    latestTime,
    duration,
    increaseTimeTo
} from './helpers/crowdsale-helper'
'use strict';

const BigNumber = web3.BigNumber
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const basicToken = artifacts.require("basicToken");
const basicCrowdsale = artifacts.require("basicCrowdsale");


const mintableToken = artifacts.require("mintableToken");
const mintableCrowdsale = artifacts.require("mintableCrowdsale");


const tokenSafe = artifacts.require("tokenSafe");

contract('tokenSafeTest', function(accounts) {
    let _tokenSafe;

    let _mintableToken;
    let _mintableCrowdsale;


    let _basicToken;
    let _basicCrowdsale;

    let _startTime;
    let _endTime;
    let _afterEndTime;
    let _lockIsOver;
    const reciever_wallet = accounts[1];
    const safe_owner = accounts[2];

    const basic_contract_owner = accounts[4];
    const mintable_contract_owner = accounts[5];
    const random_user = accounts[6];

    const _basicOwner = accounts[8];
    const _mintableOwner = accounts[9];
    const value = ether(1);
    const _totalSupply = 20000000000000000000000000000;
    before(async function() {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    })
    beforeEach(async function() {
        // We are adding one week to test for payment rejection before crowdsale starts
        _startTime = latestTime() + duration.weeks(1);
        _endTime = _startTime + duration.weeks(1);
        _afterEndTime = _endTime + duration.seconds(1)
        _lockIsOver = _afterEndTime + duration.seconds(5)
        ///////////////////////////////////////
        _basicCrowdsale = await basicCrowdsale.new(
            _startTime,
            _endTime,
            reciever_wallet,
            "BST", "Basic Token", 18,
            _totalSupply, {
                from: basic_contract_owner
            })
        _basicToken = basicToken.at(await _basicCrowdsale._token())
        ///////////////////////////////////////
        _mintableCrowdsale = await mintableCrowdsale.new(
            _startTime,
            _endTime,
            reciever_wallet,
            "MNT", "Mintable Token", 18,

            {
                from: mintable_contract_owner
            })
        _mintableToken = mintableToken.at(await _mintableCrowdsale._token())
        ///////////////////////////////////////

        await increaseTimeTo(_startTime)
        ///////////////////////////////////////
        await _basicCrowdsale.sendTransaction({
            from: _basicOwner,
            to: _basicCrowdsale.address,
            value: value
        })

        await _mintableCrowdsale.sendTransaction({
            from: _mintableOwner,
            to: _mintableCrowdsale.address,
            value: 2 * value
        })
        ///////////////////////////////////////

        await increaseTimeTo(_afterEndTime)
        await _basicCrowdsale.finalize({
            from: basic_contract_owner
        })

        await _mintableCrowdsale.finalize({
            from: mintable_contract_owner
        })
        ///////////////////////////////////////
        _tokenSafe = await tokenSafe.new(_basicToken.address,5,{from:safe_owner});

    })
    describe('Initial Tests after crowdsale is over', function () {
          it('have the current number of basic tokens in accounts[8] ', async function () {
            const Balance = await _basicToken.balanceOf(_basicOwner);
            Balance.should.be.bignumber.equal(new BigNumber(50000000000000000000));
          })
          it('have the no of mintable token in accounts[8] ', async function () {
            const Balance = await _mintableToken.balanceOf(_basicOwner);
            Balance.should.be.bignumber.equal(new BigNumber(0));
          })
          it('have the current number of mintable tokens in accounts[9] ', async function () {
            const Balance = await _mintableToken.balanceOf(_mintableOwner);
            Balance.should.be.bignumber.equal(new BigNumber(100000000000000000000));
          })
          it('have the no of basic token in accounts[9] ', async function () {
            const Balance = await _basicToken.balanceOf(_mintableOwner);
            Balance.should.be.bignumber.equal(new BigNumber(0));
          })
        })

        describe('Main tests - Recieving Tokens', function() {
          it('return the current number of times each user deposited tokens into it ', async function () {
            await _basicToken.transfer(random_user,10,{from:_basicOwner})

            await _basicToken.transfer(_tokenSafe.address,5,{from:_basicOwner})
            await _basicToken.transfer(_tokenSafe.address,5,{from:_basicOwner})
            await _basicToken.transfer(_tokenSafe.address,10,{from:accounts[6]})

            const BasicOwnerTransferCount = await _tokenSafe.getUserDepositCounts.call(_basicOwner);
            const RandomUserTransferCount = await _tokenSafe.getUserDepositCounts.call(random_user);


            BasicOwnerTransferCount.should.be.bignumber.equal(new BigNumber(2));
            RandomUserTransferCount.should.be.bignumber.equal(new BigNumber(1));
          })
          it('should fail if recieves a mintable token ', async function () {
            await _mintableToken.transfer(_tokenSafe.address,5,{from:_mintableOwner})
            .should.be.rejected
          })
          it('return the current number of times each user deposited tokens into it ', async function () {
            await _basicToken.transfer(random_user,10,{from:_basicOwner})

            await _basicToken.transfer(_tokenSafe.address,5,{from:_basicOwner})
            await _basicToken.transfer(_tokenSafe.address,5,{from:_basicOwner})
            await _basicToken.transfer(_tokenSafe.address,10,{from:accounts[6]})

            const BasicOwnerTransferCount = await _tokenSafe.getUserDepositCounts.call(_basicOwner);
            const RandomUserTransferCount = await _tokenSafe.getUserDepositCounts.call(random_user);

            BasicOwnerTransferCount.should.be.bignumber.equal(new BigNumber(2));
            RandomUserTransferCount.should.be.bignumber.equal(new BigNumber(1));
          })
          it('return the currect deposit value ', async function() {
                await _basicToken.transfer(_tokenSafe.address, 5, {from: _basicOwner})
                await _basicToken.transfer(_tokenSafe.address, 15, {from: _basicOwner})
                const depositID = (await _tokenSafe.getFirstDepositID.call(_basicOwner)) + 1;
                const deposit_value = await _tokenSafe.getUserDepositValue.call(_basicOwner, depositID);
                depositID.should.be.bignumber.equal(new BigNumber(1));
                deposit_value.should.be.bignumber.equal(new BigNumber(15));
              })
              // it('should get currect user deposit block ', async function () {
              //     await _basicToken.transfer(_tokenSafe.address, 5, {from: _basicOwner  })
              //     await _basicToken.transfer(_tokenSafe.address, 15, {from: _basicOwner  })
              //
              //     const blockOne =  await _tokenSafe.getUserDepositBlock.call(_basicOwner,1)
              //     const blockTwo =  await _tokenSafe.getUserDepositBlock.call(_mintableOwner,1)
              //     //+1 is adeed because it takes some time
              //     blockOne.should.be.bignumber.equal(new BigNumber(_afterEndTime+1));
              //     blockTwo.should.be.bignumber.equal(new BigNumber(0));
              //     })
            })
            describe('Main tests - Token safe settings', function() {
              it('should change withdrawal time currectly ', async function () {
                await _tokenSafe.setLockDuration(10,{from:safe_owner});
                const value = await _tokenSafe.getLockDuration.call();
                value.should.be.bignumber.equal(new BigNumber(10));
              })
              it('should fail if someone other than the owner tries to change withdrawal time ', async function () {
                await _tokenSafe.setLockDuration(10,{from:_basicOwner})
                        .should.be.rejected
              })
              it('should succeed if the owner is transferring ownership ', async function () {
                await _tokenSafe.transferOwnership(_basicOwner,{from:safe_owner})
                        .should.be.fulfilled
              })
              it('should fail if someone other than owner wants to transfer ownership ', async function () {
                await _tokenSafe.transferOwnership(_basicOwner,{from:_basicOwner})
                        .should.be.rejected
              })
              it('should bahave as expected when paused and unpaused ', async function () {
                await _tokenSafe.pause({from:safe_owner})

                await _tokenSafe.transferOwnership(_basicOwner,{from:safe_owner})
                      .should.be.rejected
                await _basicToken.transfer(_tokenSafe.address, 5, {from: _basicOwner  })
                      .should.be.rejected
                await _tokenSafe.resume({from:safe_owner})

                await _tokenSafe.transferOwnership(_basicOwner,{from:safe_owner})
                      .should.be.fulfilled
                await _basicToken.transfer(_tokenSafe.address, 5, {from: _basicOwner  })
                      .should.be.fulfilled

              })
              it('should fail to pause or unpause if anyone other than the owner calls these fucntions ', async function () {
                await _tokenSafe.pause({from:_basicOwner})
                        .should.be.rejected
                await _tokenSafe.resume({from:_basicOwner})
                        .should.be.rejected

              })
            })
            describe('Main tests - Withdrawing Tokens', function() {


              it('should return currect withdrawal time ', async function () {
                const value = await _tokenSafe.getLockDuration.call()
                value.should.be.bignumber.equal(new BigNumber(5));
              })
              it('should withdraw the currect amount ', async function () {
                  const initialBalance = await  _basicToken.balanceOf(_basicOwner) ;
                  await _basicToken.transfer(_tokenSafe.address, 5, {from: _basicOwner  })
                  await _basicToken.transfer(_tokenSafe.address, 15, {from: _basicOwner  })
                  const finalBalance =  await _basicToken.balanceOf(_basicOwner) ;

                  await increaseTimeTo(_lockIsOver)

                  let {logs} = await _tokenSafe.withdraw({from: _basicOwner  })
                  const firstRedemtion = await _basicToken.balanceOf(_basicOwner) ;
                  firstRedemtion.minus(finalBalance).should.be.bignumber.equal(5);
                  let event = logs.find(e => e.event === 'Withdraw')
                  should.exist(event)
                  event.args.addr.should.equal(_basicOwner)
                  event.args.amount.should.be.bignumber.equal(new BigNumber(5))
                  })
                  it('should fail to withdraw before the set time is passed ', async function () {
                      const initialBalance = await  _basicToken.balanceOf(_basicOwner) ;
                      await _basicToken.transfer(_tokenSafe.address, 5, {from: _basicOwner  })
                      await _tokenSafe.withdraw.call({from: _basicOwner  }).should.be.rejected
                  })
            })



        })

import {
    ether,
    advanceBlock,
    latestTime,
    duration,
    increaseTimeTo
} from './helpers/crowdsale-helper'
'use strict';
const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const CrowdsaleInstance = artifacts.require("crowdsale");
const TokenInstance = artifacts.require("token");
contract('crowdsaleTest', function(accounts) {
    const contract_owner = accounts[5];
    const reciever_wallet = accounts[1];
    const purchaser = accounts[2];
    const sponsor = accounts[3];
    const value = ether(2);
    const _totalSupply = 30000000000000000000000000000;
    let _crowdsale;
    let _token;
    let _startTime;
    let _endTime;
    let _afterEndTime;
    before(async function() {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    })
    describe('\n\n\t\t\t\t\t\t--- Basic Crowdsale --- \n', function ()
    {
      beforeEach(async function() {
          // We are adding one week to test for payment rejection before crowdsale starts
          _startTime = latestTime() + duration.weeks(1);
          _endTime = _startTime + duration.weeks(1);
          _afterEndTime = _endTime + duration.seconds(1)
          _crowdsale = await CrowdsaleInstance.new(
              _startTime,
              _endTime,
              _totalSupply,
              reciever_wallet,
              "BST", "Basic Token", 18,
              _totalSupply,50,
              {from: contract_owner})
          _token = TokenInstance.at(await _crowdsale.getToken.call())
      })
      describe('\nTests Before Crowdsale Starts\n', function () {
        it("Accounts[5] should be crowdsale owner", async function() {

            const ownerAddress = await _crowdsale.getOwner.call()
            ownerAddress.should.equal(contract_owner)

        })
        it("crowdsale contact should be the owner of implementer of crowdsale contract", async function() {
            const ownerAddress = await _crowdsale.getChildOwner.call()
            ownerAddress.should.equal(_crowdsale.address)
        })
        it("implementer of crowdsale contract should be the token owner", async function() {
          const tokenOwner = await _token.getOwner.call()
          const childContractAddress = await _crowdsale.getChildAddress.call()
          tokenOwner.should.equal(childContractAddress)
        })
        it('should have a fixed total supply of tokens when crowdsale is ceated', async function () {
          const totalSupply = await _token.totalSupply()
          totalSupply.should.be.bignumber.equal(_totalSupply)
        })
        it('token owner should hold all the tokens when crowdsale is deployed', async function () {
          const tokenAddress = await _crowdsale.getToken.call()
          const totalSupply = await _token.totalSupply()
          const balance = await _token.balanceOf(tokenAddress);
          balance.should.be.bignumber.equal(totalSupply)
        })
        it('should reject payments before start - contract fallback function', async function ()
          {
            await _crowdsale.send(value)
            .should.be.rejected
          })
        })
        describe('\nTests During Crowdsale Starts\n', function () {
          beforeEach(async function(){
            await increaseTimeTo(_startTime)
          });
          describe('\n\tFunctions\n', function () {
            it('should accept payments after start - contract fallback function', async function() {
                await _crowdsale.send(value).should.be.fulfilled
            })
            it('should transfer tokens to buyer -contract fallback function ', async function () {
              await _crowdsale.send(value)
              let balance = await _token.balanceOf(accounts[0]);
              const ReturnTokensAmount = new BigNumber(value*50);
              balance.should.be.bignumber.equal(ReturnTokensAmount)
            })
            it('should have the current amount of tokens in token contract after sale ', async function () {
              const tokenAddress = await _crowdsale.getToken.call()
              const InitialOwnerBalance = new BigNumber((await _token.balanceOf(tokenAddress)))
              await _crowdsale.send(value)
              const OwnerBalanceAfterTransfer = new BigNumber((await _token.balanceOf(tokenAddress)).valueOf())
              const ReturnTokensAmount = new BigNumber(value*50);
              InitialOwnerBalance.minus(OwnerBalanceAfterTransfer).should.be.bignumber.equal(ReturnTokensAmount);
            })
            it('should store recieved ethers in the wallet', async function () {
              const pre =  web3.eth.getBalance(reciever_wallet);
              await _crowdsale.send(value)
              const post = web3.eth.getBalance(reciever_wallet);
              post.minus(pre).should.be.bignumber.equal(value);
            })
          })
          describe('\n\tEvents\n', function () {
            it('should emit currect events when ethers are sent to contract', async function () {
              const {logs} =  await _crowdsale.send(value)
              const ReturnTokensAmount = new BigNumber(value*50);
              const event = logs.find(e => e.event === 'TokenPurchase')
              should.exist(event)
              event.args.sender.should.equal(accounts[0])
              event.args.value.should.be.bignumber.equal(value)
              event.args.amount.should.be.bignumber.equal(ReturnTokensAmount)
            })
          })
        })
        describe('\nTests After Crowdsale ends\n', function () {
          let owner;
          let ownerAddress ;
          let InitialOwnerBalance ;
          let OwnerBalanceAfterTransfer;
          let RecieverOneBalance;
          let RecieverTwoBalance;


          let tokenAddress;
          let TokenContractBalance;
          beforeEach(async function(){
            tokenAddress = await _crowdsale.getToken.call()
            await increaseTimeTo(_startTime)
            await _crowdsale.sendTransaction({from:accounts[6], to:_crowdsale.address, value: value})
            await _crowdsale.sendTransaction({from:accounts[7], to:_crowdsale.address, value: 2*value})
            TokenContractBalance = new BigNumber(await _token.balanceOf(tokenAddress))
          });
          describe('\n\tFunctions\n', function () {
            it('Should fail if finalize function is called before end time', async function () {
              await _crowdsale.finalize({from:contract_owner})
                    .should.be.rejected
            })
            it('Token Contract should have 0 tokens after calling finalize function at the right time', async function () {
              await increaseTimeTo(_afterEndTime)
              await _crowdsale.finalize({from:contract_owner})
              const FinalOwnerBalance = new BigNumber(await _token.balanceOf(tokenAddress))
              FinalOwnerBalance.should.be.bignumber.equal(new BigNumber(0));
            })
            it('Accounts[6] and Accounts[7] should have the currect balance ', async function () {
              await increaseTimeTo(_afterEndTime)
              await _crowdsale.finalize({from:contract_owner})
              const FinalRecieverOneBalance  = new BigNumber(await _token.balanceOf(accounts[6]));
              const FinalRecieverTwoBalance = new BigNumber(await _token.balanceOf(accounts[7]));
              FinalRecieverOneBalance.should.be.bignumber.equal(new BigNumber(value*50));
              FinalRecieverTwoBalance.should.be.bignumber.equal(new BigNumber(2*value*50));
            })

            it('should reject payments after end - contract fallback function', async function () {
              await increaseTimeTo(_afterEndTime)
              await _crowdsale.send(value)
                .should.be.rejected
            })
          })
          describe('\n\tTesting Token\n', function () {
            beforeEach(async function(){
                await increaseTimeTo(_afterEndTime)
                await _crowdsale.finalize({from:contract_owner})
            });
            it("should return the correct totalSupply after construction", async function() {
                const totalSupply = await _token.totalSupply();
                totalSupply.should.be.bignumber.equal(new BigNumber(3*value*50));
            });

            it("should return correct balances after transfer", async function(){
              this.timeout(4500000);
              await _token.transfer(accounts[6], value * 50 ,{from:accounts[7]});
              const firstAccountBalance = await _token.balanceOf(accounts[6]);
              const secondAccountBalance = await _token.balanceOf(accounts[7]);
              firstAccountBalance.should.be.bignumber.equal(new BigNumber(2*value*50));
              secondAccountBalance.should.be.bignumber.equal(new BigNumber(value*50));
            });
            it("should return currect owner balance after owner burning 100 tokens", async function() {
              await _token.burn(value * 50,{from:accounts[7]});
              const ownerBalance = await _token.balanceOf(accounts[7])
              ownerBalance.should.be.bignumber.equal(new BigNumber(value * 50));
            });
            it("should return currect total balance after owner burns 100 tokens", async function() {
              await _token.burn(value * 50,{from:accounts[7]});
              let totalSupply = await _token.totalSupply();
              totalSupply.should.be.bignumber.equal(new BigNumber(2 * value * 50));
            });
            it('should throw an error when trying to call mint function', async function() {
              this.timeout(4500000);
              await _token.mint(accounts[1], 200)
                  .should.be.rejected
            });
            it('should throw an error when trying to transfer more than balance', async function() {
              await _token.transfer(accounts[0], 501,{ from: accounts[1] })
                  .should.be.rejected
            });

            it('should throw an error when trying to transfer to 0x0', async function() {
                await _token.transfer(0x0, 100,{ from: accounts[6]  })
                  .should.be.rejected
            });

            it('should throw an error when trying to burn more than owners balance', async function() {
              this.timeout(4500000);
              await _token.burn((value * 50 * 2, { from: accounts[6] }))
                  .should.be.rejected
            });
          })
        })
    })

    describe('\n\n\t\t\t\t\t\t--- Mintable Crowdsale --- \n', function ()
    {
      beforeEach(async function() {
          // We are adding one week to test for payment rejection before crowdsale starts
          _startTime = latestTime() + duration.weeks(1);
          _endTime = _startTime + duration.weeks(1);
          _afterEndTime = _endTime + duration.seconds(1)
          _crowdsale = await CrowdsaleInstance.new(
              _startTime,
              _endTime,
              _totalSupply,
              reciever_wallet,
              "MNT", "Mintable Token", 18,
              0,50,
              {from: contract_owner})
          _token = TokenInstance.at(await _crowdsale.getToken.call())
      })
      describe('\nTests Before Crowdsale Starts\n', function () {
        it("Accounts[5] should be crowdsale owner", async function() {

            const ownerAddress = await _crowdsale.getOwner.call()
            ownerAddress.should.equal(contract_owner)

        })
        it("crowdsale contact should be the owner of implementer of crowdsale contract", async function() {
            const ownerAddress = await _crowdsale.getChildOwner.call()
            ownerAddress.should.equal(_crowdsale.address)
        })
        it("implementer of crowdsale contract should be the token owner", async function() {
          const tokenOwner = await _token.getOwner.call()
          const childContractAddress = await _crowdsale.getChildAddress.call()
          tokenOwner.should.equal(childContractAddress)
        })
        it('should have a 0 total supply of tokens when crowdsale is ceated', async function () {
          const totalSupply = await _token.totalSupply()
          totalSupply.should.be.bignumber.equal(0)
        })
        it('token owner should no tokens when crowdsale is deployed', async function () {
          const tokenAddress = await _crowdsale.getToken.call()
          const totalSupply = await _token.totalSupply()
          const balance = await _token.balanceOf(tokenAddress);
          balance.should.be.bignumber.equal(totalSupply)
        })
        it('should reject payments before start - contract fallback function', async function ()
          {
            await _crowdsale.send(value)
            .should.be.rejected
          })
        })
        describe('\nTests During Crowdsale Starts\n', function () {
          beforeEach(async function(){
            await increaseTimeTo(_startTime)
          });
          describe('\n\tFunctions\n', function () {
            it('should accept payments after start - contract fallback function', async function() {
                await _crowdsale.send(value).should.be.fulfilled
            })
            it('should transfer tokens to buyer -contract fallback function ', async function () {
              await _crowdsale.send(value)
              let balance = await _token.balanceOf(accounts[0]);
              const ReturnTokensAmount = new BigNumber(value*50);
              balance.should.be.bignumber.equal(ReturnTokensAmount)
            })

            it('should store recieved ethers in the wallet', async function () {
              const pre =  web3.eth.getBalance(reciever_wallet);
              await _crowdsale.send(value)
              const post = web3.eth.getBalance(reciever_wallet);
              post.minus(pre).should.be.bignumber.equal(value);
            })
          })
          describe('\n\tEvents\n', function () {
            it('should emit currect events when ethers are sent to contract', async function () {
              const {logs} =  await _crowdsale.send(value)
              const ReturnTokensAmount = new BigNumber(value*50);
              const event = logs.find(e => e.event === 'TokenPurchase')
              should.exist(event)
              event.args.sender.should.equal(accounts[0])
              event.args.value.should.be.bignumber.equal(value)
              event.args.amount.should.be.bignumber.equal(ReturnTokensAmount)
            })
          })
        })
        describe('\nTests After Crowdsale ends\n', function () {
          let owner;
          let ownerAddress ;
          let InitialOwnerBalance ;
          let OwnerBalanceAfterTransfer;
          let RecieverOneBalance;
          let RecieverTwoBalance;


          let tokenAddress;
          let TokenContractBalance;
          beforeEach(async function(){
            tokenAddress = await _crowdsale.getToken.call()
            await increaseTimeTo(_startTime)
            await _crowdsale.sendTransaction({from:accounts[6], to:_crowdsale.address, value: value})
            await _crowdsale.sendTransaction({from:accounts[7], to:_crowdsale.address, value: 2*value})
            TokenContractBalance = new BigNumber(await _token.balanceOf(tokenAddress))
          });
          describe('\n\tFunctions\n', function () {
            it('Should fail if finalize function is called before end time', async function () {
              await _crowdsale.finalize({from:contract_owner})
                    .should.be.rejected
            })

            it('Accounts[6] and Accounts[7] should have the currect balance ', async function () {
              await increaseTimeTo(_afterEndTime)
              await _crowdsale.finalize({from:contract_owner})
              const FinalRecieverOneBalance  = new BigNumber(await _token.balanceOf(accounts[6]));
              const FinalRecieverTwoBalance = new BigNumber(await _token.balanceOf(accounts[7]));
              FinalRecieverOneBalance.should.be.bignumber.equal(new BigNumber(value*50));
              FinalRecieverTwoBalance.should.be.bignumber.equal(new BigNumber(2*value*50));
            })

            it('should reject payments after end - contract fallback function', async function () {
              await increaseTimeTo(_afterEndTime)
              await _crowdsale.send(value)
                .should.be.rejected
            })
          })
          describe('\n\tTesting Token\n', function () {
            beforeEach(async function(){
                await increaseTimeTo(_afterEndTime)
                await _crowdsale.finalize({from:contract_owner})
            });
            it("should return the correct totalSupply after construction", async function() {
                const totalSupply = await _token.totalSupply();
                totalSupply.should.be.bignumber.equal(new BigNumber(3*value*50));
            });

            it("should return correct balances after transfer", async function(){
              this.timeout(4500000);
              await _token.transfer(accounts[6], value * 50 ,{from:accounts[7]});
              const firstAccountBalance = await _token.balanceOf(accounts[6]);
              const secondAccountBalance = await _token.balanceOf(accounts[7]);
              firstAccountBalance.should.be.bignumber.equal(new BigNumber(2*value*50));
              secondAccountBalance.should.be.bignumber.equal(new BigNumber(value*50));
            });
            it("should return currect owner balance after owner burning 100 tokens", async function() {
              await _token.burn(value * 50,{from:accounts[7]});
              const ownerBalance = await _token.balanceOf(accounts[7])
              ownerBalance.should.be.bignumber.equal(new BigNumber(value * 50));
            });
            it("should return currect total balance after owner burns 100 tokens", async function() {
              await _token.burn(value * 50,{from:accounts[7]});
              let totalSupply = await _token.totalSupply();
              totalSupply.should.be.bignumber.equal(new BigNumber(2 * value * 50));
            });
            it('should throw an error when trying to call mint function', async function() {
              this.timeout(4500000);
              await _token.mint(accounts[1], 200)
                  .should.be.rejected
            });
            it('should throw an error when trying to transfer more than balance', async function() {
              await _token.transfer(accounts[0], 501,{ from: accounts[1] })
                  .should.be.rejected
            });

            it('should throw an error when trying to transfer to 0x0', async function() {
                await _token.transfer(0x0, 100,{ from: accounts[6]  })
                  .should.be.rejected
            });

            it('should throw an error when trying to burn more than owners balance', async function() {
              this.timeout(4500000);
              await _token.burn((value * 50 * 2, { from: accounts[6] }))
                  .should.be.rejected
            });
          })
        })
    })


});

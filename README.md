SmartRefer's Crowdsale Factory is a collection of smart contracts made for Ethereum-based crowdsales, using the ERC-223 standard. We decided to build the world's first comprehensive, easy to follow, ERC-223 library to help other Ethereum-based projects fast-track their development. 

Currently, there are no other complete crowdsale boilerplates based on the ERC-223 standard. 
Our work is based on the original ERC223 standard proposed by @dexaran (GitHub). Our code was heavily inspired by Zeppelin Solutions library.

While planning our platform's impending Pre-Sale (January 18th, 2017), we did exhaustive technical research on different patterns of launching various crowdsales, different contract types and the most common issues encountered. By researching more than 30 crowdsales, we took note of the most common patterns and design choices. We have completely restructured, and implemented them in our library.

Our library and contracts are fully backward compatible with the ERC-20 standard; we decided to run a rewritten version of Zeppelin Solution test cases on our library to confirm that. Additionally, we tried to be as thorough as possible while writing comments so that this could be a valuable learning resource for programmers transition into learning Solidity.
# Advantages
#### ERC223 was chosen because it has the following features:
* Allows contract developers to handle incoming token transactions same way as they would treat an Ether transaction due to a tokenFallback() function.
* ERC223 transfer to contract consumes half as much gas as ERC20 approve and transferFrom at receiver contract.
* Provides a possibility to avoid accidentally lost tokens inside contracts that are not designed to work with sent tokens.
For instance, when users send the tokens to the token's contract by mistake, they would be held by those contracts. These tokens will not be accessible as there is no function to withdraw them from the contract, making them effectively lost:
  * 244131 GNT in Golem contract ~ $54333: https://etherscan.io/token/Golem?a=0xa74476443119a942de498590fe1f2454d7d4ac0d
  * 200 REP in Augur contract ~ $3292: https://etherscan.io/token/REP?a=0x48c80f1f4d53d5951e5d5438b54cba84f29f32a5
  * 777 DGD in Digix DAO contract ~ $7500: https://etherscan.io/token/0xe0b7927c4af23765cb51314a0e0521a9645f0e2a?a=0xe0b7927c4af23765cb51314a0e0521a9645f0e2a
  * 10150 1ST in FirstBlood contract ~ $3466: https://etherscan.io/token/FirstBlood?a=0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7
  * 30 MLN in Melonport contract ~ $1197: https://etherscan.io/token/Melon?a=0xBEB9eF514a379B997e0798FDcC901Ee474B6D9A1+
  
  
#### Only The Essential Smart Contracts 
* By researching more than 30 crowdsales, we took note of the most common patterns and design choices. We have completely restructured, and implemented them in our library. 
* Our library and contracts are fully backward compatible with the ERC20 standard; we decided to run a rewritten version of Zeppelin Solution test cases on our library to confirm that. 
# How to use
* Bridge design pattern has been used in implementing crowdsale, receiver and token contracts
* We decided to create two token type and corresponding crowdsale boilerplates:
  * Token smart contracts are designed and initialized inside Crowdsale smart contracts.
  * Basic Token and Basic Crowdsale: In this token, you would set the total number of tokens in Tokens constructor. After the crowdsale is over, the Crowdsale contract's owner has to call Crowdsale contract's finalize() function, burning any remaining tokens.Only Crowdsale contract's owner is allowed to call that function.A suggestion is to use Oraclize or Ethereum Alarm clock to call this function after Crowdsale is over automatically.
  * Mintable Token and Mintable Crowdsale: In this token type, initially, the total number of tokens is set to zero. As the Mintable crowdsale receives Ether, it would invoke Mintable Tokens Mint() function to create tokens; this would eliminate the need for burning the remaining tokens after the crowdsale is over. Also, it should be noted that only mintable token's owner ( Mintable Crowdsale smart contract ) is allowed to call the Mint() function.
# Known Issue
Some disrepencies between ERC20/ERC223 naming convention causes my etherwallet not to recognize the tokens as compatible.
the logic works perfectly
**This issue has been fixed in Smartrefer Crowdsale contract and the tokens are recognized by ERC20 wallets**
# Todo
- [x] Basic Token
- [x] Basic Token crowdsale
- [x] Mintable token
- [x] Mintable token crowdsale
- [x] re-write Zeppelin solution tests and confirm erc20 compatiblity
- [x] Some housekeeping on the tests
- [x] re-written contracts based on bridge design pattern
- [x] re-written test cases for the new contract
- [ ] write test for cases where users are directly accessing implementor interface child contracts
- [ ] write contract for hybrid token.
- [ ] make tokens upgradable ( for instance , ERC223 initially , then upgradable to Bancor smart token or another token standard ) 
- [ ] add multi-tiered crowdsale.
- [ ] add crowdsale with refund option if the target was not met.
- [ ] modify the existing crowdsale contract for dynamic cap implementation.
- [ ] update reciever contract so it would offer a withdraw option.
- [ ] add an adapter pattern inspired contract for accepting ERC20 tokens.
- [ ] write new test cases.
- [ ] deploy and test on live testnet.
- [ ] update comments
# Credit
* Zeppelin Solutions: https://github.com/OpenZeppelin/zeppelin-solidity
* @Dexaran ERC223 Proposal: https://github.com/Dexaran/ERC223-token-standard
* Aragon : https://github.com/aragon/ERC23

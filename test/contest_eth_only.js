const BN = require('bn.js'); // https://github.com/indutny/bn.js
const util = require('util');
const ContestETHOnly = artifacts.require("ContestETHOnly");
const ContestETHOnlyMock = artifacts.require("ContestETHOnlyMock");
//const ERC20MintableToken = artifacts.require("ERC20Mintable");
const truffleAssert = require('truffle-assertions');

const helper = require("../helpers/truffleTestHelper");

contract('ContestETHOnly', (accounts) => {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];  
    const accountThree = accounts[2];
    const accountFourth= accounts[3];
    const accountFive = accounts[4];
    const accountSix = accounts[5];
    const accountSeven = accounts[6];
    const accountEight = accounts[7];
    const accountNine = accounts[8];
    const accountTen = accounts[9];
    const accountEleven = accounts[10];
    const accountTwelwe = accounts[11];

    
    
    // setup useful values
    const oneEther = 1000000000000000000; // 1eth
    const stageID = 0;
    const contestID = 0;
  
    it('should disable recieve() method', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInBlocksCount,
                                                                100, // votePeriodInBlocksCount,
                                                                100, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        const amountETHSendToContract = 1*10**18; // 1ETH
        // send ETH to Contract
        await truffleAssert.reverts(
            web3.eth.sendTransaction({
                from:accountOne,
                to: ContestETHOnlyInstance.address, 
                value: amountETHSendToContract
                
            }),
            "Method does not support. Send ETH with pledgeETH() method"
        );
        
    });
    
    it('should enter in active stage', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInBlocksCount,
                                                                100, // votePeriodInBlocksCount,
                                                                100, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountOne });
        
        // revert if trying to double enter
        await truffleAssert.reverts(
            ContestETHOnlyInstance.enter(stageID, contestID, { from: accountOne }),
            "Sender must not be in contestant list"
        );

    });
    
    it('should leave in active stage if entered before', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInBlocksCount,
                                                                100, // votePeriodInBlocksCount,
                                                                100, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountOne });
        
        await ContestETHOnlyInstance.leave(stageID, contestID, { from: accountOne });
        
        // revert if trying to double enter
        await truffleAssert.reverts(
            ContestETHOnlyInstance.leave(stageID, contestID, { from: accountOne }),
            "Sender must be in contestant list"
        );

    });
    
    it('should prevent pledge if entered before', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInBlocksCount,
                                                                100, // votePeriodInBlocksCount,
                                                                100, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
                                                                
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountOne });
        
        // revert if trying to double enter
        await truffleAssert.reverts(
            ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) }),
            "Sender must not be in contestant list"
        );

    });
    
    it('should pledge before and during contestPeriod', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInBlocksCount,
                                                                100, // votePeriodInBlocksCount,
                                                                100, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        await ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) });
        
        
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountTwo });
        
        
                    
    });
    
    it('should prevent pledge in voting or revoking periods', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        // make some pledge to reach minimum                                                                
        await ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) });
        await ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) });
        await ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) });

        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        // try to pledge again
        await truffleAssert.reverts(
            ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) }),
            "Stage is out of contest period"
        );
        
        // pass another 10 block. to revoke period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        // try to pledge again
        await truffleAssert.reverts(
            ContestETHOnlyInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(oneEther).toString(16) }),
            "Stage is out of contest period"
        );
        
    });
    
    it('should prevent double vote ', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        // make some pledge to reach minimum
        await ContestETHOnlyInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountTwo });
        await ContestETHOnlyInstance.vote(accountTwo, stageID, contestID, { from: accountOne});
        await truffleAssert.reverts(
            ContestETHOnlyInstance.vote(accountTwo, stageID, contestID, { from: accountOne}),
            "must have not voted or delegated before"
        );
        
    });
    
    it('should prevent vote outside of voting period', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
        // make some pledge to reach minimum
        await ContestETHOnlyInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        await ContestETHOnlyInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        await truffleAssert.reverts(
            ContestETHOnlyInstance.vote(accountTwo, stageID, contestID, { from: accountOne}),
            "Stage is out of voting period"
        );
        
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await truffleAssert.reverts(
            ContestETHOnlyInstance.vote(accountTwo, stageID, contestID, { from: accountOne}),
            "contestantAddress must be in contestant list"
        );
        
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountTwo });
        
        
        await ContestETHOnlyInstance.vote(accountTwo, stageID, contestID, { from: accountOne});
        
        // pass another 10 block. to revoke period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountThree });
        await truffleAssert.reverts(
            ContestETHOnlyInstance.vote(accountThree, stageID, contestID, { from: accountFourth}),
            "Stage is out of voting period"
        );
    });
    
    it('should delegate to some1', async () => {
        const ContestETHOnlyInstance = await ContestETHOnly.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
        // make some pledge to reach minimum
        await ContestETHOnlyInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        await ContestETHOnlyInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await ContestETHOnlyInstance.enter(stageID, contestID, { from: accountTwo });
        
        await ContestETHOnlyInstance.delegate(accountTwo, stageID, contestID, { from: accountOne});
        
        
    });    

    it('should revoke on revoking period', async () => {
        
        
       
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );

        const revokeFee = (await ContestETHOnlyMockInstance.getRevokeFee({from: accountOne}));
        const accountFourthStartingBalance = (await web3.eth.getBalance(accountFourth));
        
        
        // make some pledge to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        let pledgeTxObj = await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        // pass 20 block.   to revoking period
        for (let i=0; i<20; i++) {
            await helper.advanceBlock();
        }
        
        // make revoke 
        let revokeTxObj = await ContestETHOnlyMockInstance.revoke(stageID, contestID, { from: accountFourth});
        
        const accountFourthEndingBalance = (await web3.eth.getBalance(accountFourth));

        assert.notEqual(new BN(accountFourthStartingBalance,16).toString(16), new BN(accountFourthEndingBalance,16).toString(16), "Balance after revoke is equal" );
        
        
        let pledgeTx = await web3.eth.getTransaction(pledgeTxObj.tx);
        let revokeTx = await web3.eth.getTransaction(revokeTxObj.tx);

        let actual = (new BN(accountFourthEndingBalance,10)).toString(16);
        let expected = (
            // starting balance
            (
                new BN(accountFourthStartingBalance,10)
            )
            // revoke fee 
            .sub(
                (new BN((1*oneEther).toString(16),16)).mul(new BN(revokeFee,10)).div(new BN(1e6,10))
            )
            // consuming for pledge transaction 
            .sub(
                (new BN(pledgeTxObj["receipt"].gasUsed,10)).mul(new BN(pledgeTx.gasPrice,10))
                )
            // consuming for revoke transaction 
            .sub(
                (new BN(revokeTxObj["receipt"].gasUsed,10)).mul(new BN(revokeTx.gasPrice,10))
                )
            ).toString(16);

        assert.equal(
            actual, 
            expected, 
            "Wrong revokeFee consuming"
        );
        
    });  
  
    it('Stage Workflow: should get correct prizes for winners&losers', async () => {
        
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
                                                                
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountNine });
        
        
        // make some pledge 11ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, contestID, { from: accountTwo, value:'0x'+(3*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountThree, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, contestID, { from: accountOne}));
        assert.equal(
            new BN((11*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, contestID, { from: accountOne});
        await ContestETHOnlyMockInstance.vote(accountSix, stageID, contestID, { from: accountTwo});
        await ContestETHOnlyMockInstance.vote(accountSeven, stageID, contestID, { from: accountThree});
        await ContestETHOnlyMockInstance.vote(accountEight, stageID, contestID, { from: accountFourth});
        await ContestETHOnlyMockInstance.vote(accountNine, stageID, contestID, { from: accountTen});
        
        // pass blocks.   to complete period
        for (let i=0; i<20; i++) {
            await helper.advanceBlock();
        }
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountNine});
        let claim9Tx = await web3.eth.getTransaction(claim9TxObj.tx);
        
        const accountFiveEndingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixEndingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenEndingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightEndingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineEndingBalance = (await web3.eth.getBalance(accountNine));
        
        assert.equal(
            (
            new BN((11*oneEther).toString(16),16).mul(new BN(50,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountFiveEndingBalance,10)).sub(new BN(accountFiveStartingBalance,10)).add((new BN(claim5TxObj["receipt"].gasUsed,10)).mul(new BN(claim5Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(1st place)"
        );
        assert.equal(
            (
            new BN((11*oneEther).toString(16),16).mul(new BN(30,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountSixEndingBalance,10)).sub(new BN(accountSixStartingBalance,10)).add((new BN(claim6TxObj["receipt"].gasUsed,10)).mul(new BN(claim6Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(2nd place)"
        );
        assert.equal(
            (
            new BN((11*oneEther).toString(16),16).mul(new BN(10,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountSevenEndingBalance,10)).sub(new BN(accountSevenStartingBalance,10)).add((new BN(claim7TxObj["receipt"].gasUsed,10)).mul(new BN(claim7Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(3rd place)"
        );
        assert.equal(
            (
            new BN((11*oneEther).toString(16),16).mul(new BN(5,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountEightEndingBalance,10)).sub(new BN(accountEightStartingBalance,10)).add((new BN(claim8TxObj["receipt"].gasUsed,10)).mul(new BN(claim8Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (
            new BN((11*oneEther).toString(16),16).mul(new BN(5,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountNineEndingBalance,10)).sub(new BN(accountNineStartingBalance,10)).add((new BN(claim9TxObj["receipt"].gasUsed,10)).mul(new BN(claim9Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        
    });
    
    it('Stage Workflow: winners\'s same weights(order by entering)', async () => {
        
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
                                                                
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, contestID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, contestID, { from: accountOne});
        await ContestETHOnlyMockInstance.vote(accountSix, stageID, contestID, { from: accountTwo});
        await ContestETHOnlyMockInstance.vote(accountSeven, stageID, contestID, { from: accountThree});
        await ContestETHOnlyMockInstance.vote(accountEight, stageID, contestID, { from: accountFourth});
        await ContestETHOnlyMockInstance.vote(accountNine, stageID, contestID, { from: accountTen});
        
        // pass blocks.   to complete period
        for (let i=0; i<20; i++) {
            await helper.advanceBlock();
        }
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountNine});
        let claim9Tx = await web3.eth.getTransaction(claim9TxObj.tx);
        
        const accountFiveEndingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixEndingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenEndingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightEndingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineEndingBalance = (await web3.eth.getBalance(accountNine));
        
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(50,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountFiveEndingBalance,10)).sub(new BN(accountFiveStartingBalance,10)).add((new BN(claim5TxObj["receipt"].gasUsed,10)).mul(new BN(claim5Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(1st place)"
        );
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(30,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountSixEndingBalance,10)).sub(new BN(accountSixStartingBalance,10)).add((new BN(claim6TxObj["receipt"].gasUsed,10)).mul(new BN(claim6Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(2nd place)"
        );
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(10,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountSevenEndingBalance,10)).sub(new BN(accountSevenStartingBalance,10)).add((new BN(claim7TxObj["receipt"].gasUsed,10)).mul(new BN(claim7Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(3rd place)"
        );
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(5,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountEightEndingBalance,10)).sub(new BN(accountEightStartingBalance,10)).add((new BN(claim8TxObj["receipt"].gasUsed,10)).mul(new BN(claim8Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(5,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountNineEndingBalance,10)).sub(new BN(accountNineStartingBalance,10)).add((new BN(claim9TxObj["receipt"].gasUsed,10)).mul(new BN(claim9Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        
    });
  
    it('Stage Workflow: the one winner with 3 contest\'s prizes', async () => {
        
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
                                                                
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, contestID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, contestID, { from: accountOne});

        // pass blocks.   to complete period
        for (let i=0; i<20; i++) {
            await helper.advanceBlock();
        }
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountNine});
        let claim9Tx = await web3.eth.getTransaction(claim9TxObj.tx);
        
        const accountFiveEndingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixEndingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenEndingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightEndingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineEndingBalance = (await web3.eth.getBalance(accountNine));

        assert.equal(
            (17*oneEther*50/100).toString(16), 
            (
                (new BN(accountFiveEndingBalance,10)).sub(new BN(accountFiveStartingBalance,10)).add((new BN(claim5TxObj["receipt"].gasUsed,10)).mul(new BN(claim5Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(1st place)"
        );
        assert.equal(
            (17*oneEther*12.5/100).toString(16), 
            (
                (new BN(accountSixEndingBalance,10)).sub(new BN(accountSixStartingBalance,10)).add((new BN(claim6TxObj["receipt"].gasUsed,10)).mul(new BN(claim6Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (17*oneEther*12.5/100).toString(16), 
            (
                (new BN(accountSevenEndingBalance,10)).sub(new BN(accountSevenStartingBalance,10)).add((new BN(claim7TxObj["receipt"].gasUsed,10)).mul(new BN(claim7Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (17*oneEther*12.5/100).toString(16), 
            (
                (new BN(accountEightEndingBalance,10)).sub(new BN(accountEightStartingBalance,10)).add((new BN(claim8TxObj["receipt"].gasUsed,10)).mul(new BN(claim8Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (17*oneEther*12.5/100).toString(16), 
            (
                (new BN(accountNineEndingBalance,10)).sub(new BN(accountNineStartingBalance,10)).add((new BN(claim9TxObj["receipt"].gasUsed,10)).mul(new BN(claim9Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
    });
    
    it('Stage Workflow: there are no winners', async () => {
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
                                                                
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, contestID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        
        // pass blocks.   to complete period
        for (let i=0; i<30; i++) {
            await helper.advanceBlock();
        }
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountNine});
        let claim9Tx = await web3.eth.getTransaction(claim9TxObj.tx);
        
        const accountFiveEndingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixEndingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenEndingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightEndingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineEndingBalance = (await web3.eth.getBalance(accountNine));

        assert.equal(
            (17*oneEther*20/100).toString(16), 
            (
                (new BN(accountFiveEndingBalance,10)).sub(new BN(accountFiveStartingBalance,10)).add((new BN(claim5TxObj["receipt"].gasUsed,10)).mul(new BN(claim5Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(1st place)"
        );
        assert.equal(
            (17*oneEther*20/100).toString(16), 
            (
                (new BN(accountSixEndingBalance,10)).sub(new BN(accountSixStartingBalance,10)).add((new BN(claim6TxObj["receipt"].gasUsed,10)).mul(new BN(claim6Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (17*oneEther*20/100).toString(16), 
            (
                (new BN(accountSevenEndingBalance,10)).sub(new BN(accountSevenStartingBalance,10)).add((new BN(claim7TxObj["receipt"].gasUsed,10)).mul(new BN(claim7Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (17*oneEther*20/100).toString(16), 
            (
                (new BN(accountEightEndingBalance,10)).sub(new BN(accountEightStartingBalance,10)).add((new BN(claim8TxObj["receipt"].gasUsed,10)).mul(new BN(claim8Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (17*oneEther*20/100).toString(16), 
            (
                (new BN(accountNineEndingBalance,10)).sub(new BN(accountNineStartingBalance,10)).add((new BN(claim9TxObj["receipt"].gasUsed,10)).mul(new BN(claim9Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        
    });
    
    it('Stage Workflow: there are no entered', async () => {
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
                                                                
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne}),
            "Last stage have not ended yet"
        );
       
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, contestID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        const stageNumberBefore = (await ContestETHOnlyMockInstance.getStageNumber(contestID, { from: accountOne}));
        
        // pass blocks.   to complete period
        for (let i=0; i<30; i++) {
            await helper.advanceBlock();
        }
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne});
        
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountFive}), 
            "Sender must be in contestant list"
        );
        
        
        const stageNumberAfter = (await ContestETHOnlyMockInstance.getStageNumber(contestID, { from: accountOne}));
        
        assert.equal(
            ((new BN(stageNumberBefore,10)).add(new BN(1,10))).toString(16),
            new BN(stageNumberAfter,10).toString(16),
            "Stage does not switch"
        );
    });

    it('Stage Workflow: test with delegation', async () => {
        const ContestETHOnlyMockInstance = await ContestETHOnlyMock.new(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInBlocksCount,
                                                                10, // votePeriodInBlocksCount,
                                                                10, // revokePeriodInBlocksCount,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        
                                                                
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, contestID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, contestID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, contestID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, contestID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass 10 block.   to voting period
        for (let i=0; i<10; i++) {
            await helper.advanceBlock();
        }
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, contestID, { from: accountOne});
        await ContestETHOnlyMockInstance.vote(accountSix, stageID, contestID, { from: accountTwo});
        await ContestETHOnlyMockInstance.vote(accountSeven, stageID, contestID, { from: accountThree});
        await ContestETHOnlyMockInstance.delegate(accountThree, stageID, contestID, { from: accountFourth});
        await ContestETHOnlyMockInstance.delegate(accountThree, stageID, contestID, { from: accountTen});
        
        // pass blocks.   to complete period
        for (let i=0; i<20; i++) {
            await helper.advanceBlock();
        }
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, contestID, { from: accountOne});
 
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, contestID, { from: accountNine});
        let claim9Tx = await web3.eth.getTransaction(claim9TxObj.tx);
        
        const accountFiveEndingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixEndingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenEndingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightEndingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineEndingBalance = (await web3.eth.getBalance(accountNine));
        
        // 2nd place
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(30,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountFiveEndingBalance,10)).sub(new BN(accountFiveStartingBalance,10)).add((new BN(claim5TxObj["receipt"].gasUsed,10)).mul(new BN(claim5Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(2nd place)"
        );
        // 3d place
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(10,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountSixEndingBalance,10)).sub(new BN(accountSixStartingBalance,10)).add((new BN(claim6TxObj["receipt"].gasUsed,10)).mul(new BN(claim6Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(3rd place)"
        );
        // 1st place 5(vote) 1(delegated) 1(delegated)
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(50,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountSevenEndingBalance,10)).sub(new BN(accountSevenStartingBalance,10)).add((new BN(claim7TxObj["receipt"].gasUsed,10)).mul(new BN(claim7Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for winners(1st place)"
        );
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(5,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountEightEndingBalance,10)).sub(new BN(accountEightStartingBalance,10)).add((new BN(claim8TxObj["receipt"].gasUsed,10)).mul(new BN(claim8Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
        assert.equal(
            (
            new BN((17*oneEther).toString(16),16).mul(new BN(5,10)).div(new BN(100,10))
            ).toString(16), 
            (
                (new BN(accountNineEndingBalance,10)).sub(new BN(accountNineStartingBalance,10)).add((new BN(claim9TxObj["receipt"].gasUsed,10)).mul(new BN(claim9Tx.gasPrice,10)))
            ).toString(16), 
            "Wrong reward for loser"
        );
    });
});

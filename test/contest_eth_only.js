const BN = require('bn.js'); // https://github.com/indutny/bn.js
const BigNumber = require('bignumber.js');
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
    
    var ContestETHOnlyMockInstance;
    
    it('should disable recieve() method', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                        3, // stagesCount,
                                        ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                        100, // contestPeriodInSeconds,
                                        100, // votePeriodInSeconds,
                                        100, // revokePeriodInSeconds,
                                        [50,30,10], //percentForWinners,
                                        [] // judges
                                        );
        
        const amountETHSendToContract = 1*10**18; // 1ETH
        // send ETH to Contract
        await truffleAssert.reverts(
            web3.eth.sendTransaction({
                from:accountOne,
                to: ContestETHOnlyMockInstance.address, 
                value: amountETHSendToContract
                
            }),
            "Method does not support. Send ETH with pledgeETH() method"
        );
        
    });
    
    it('should enter in active stage', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInSeconds,
                                                                100, // votePeriodInSeconds,
                                                                100, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );

        await ContestETHOnlyMockInstance.enter(stageID, { from: accountOne });
        
        // revert if trying to double enter
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.enter(stageID, { from: accountOne }),
            "Sender must not be in contestant list"
        );

    });
    
    it('should leave in active stage if entered before', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInSeconds,
                                                                100, // votePeriodInSeconds,
                                                                100, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        

        await ContestETHOnlyMockInstance.enter(stageID, { from: accountOne });
        
        await ContestETHOnlyMockInstance.leave(stageID, { from: accountOne });
        
        // revert if trying to double leave
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.leave(stageID, { from: accountOne }),
            "Sender must be in contestant list"
        );

    });
    
    it('should prevent pledge if entered before', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInSeconds,
                                                                100, // votePeriodInSeconds,
                                                                100, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
                                                                
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountOne });
        
        // revert if trying to double enter
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) }),
            "Sender must not be in contestant list"
        );

    });
    
    it('should pledge before and during contestPeriod', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                100, // contestPeriodInSeconds,
                                                                100, // votePeriodInSeconds,
                                                                100, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) });
        
        
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountTwo });
        
        
                    
    });
    
    it('should prevent pledge in voting or revoking periods', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
																
        // make some pledge to reach minimum                                                                
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) });

        // pass time.   to voting period
		await helper.advanceTime(10);
        
        // try to pledge again
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) }),
            "Stage is out of contest period"
        );
        
        // pass another 10 seconds. to revoke period
        await helper.advanceTime(10);
        
        // try to pledge again
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.pledgeETH('0x'+(oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(oneEther).toString(16) }),
            "Stage is out of contest period"
        );
        
    });

    it('should prevent double vote ', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        // make some pledge to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        
        // pass time.   to voting period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountTwo });
        await ContestETHOnlyMockInstance.vote(accountTwo, stageID, { from: accountOne});
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.vote(accountTwo, stageID, { from: accountOne}),
            "must have not voted or delegated before"
        );
        
    });
    
    it('should prevent vote outside of voting period', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        // make some pledge to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.vote(accountTwo, stageID, { from: accountOne}),
            "Stage is out of voting period"
        );
        
        // pass time.   to voting period
        await helper.advanceTime(10);
        
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.vote(accountTwo, stageID, { from: accountOne}),
            "contestantAddress must be in contestant list"
        );
        
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountTwo });
        
        
        await ContestETHOnlyMockInstance.vote(accountTwo, stageID, { from: accountOne});
        
        // pass time again. to revoke period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountThree });
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.vote(accountThree, stageID, { from: accountFourth}),
            "Stage is out of voting period"
        );
    });
    
    it('should delegate to some1', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        // make some pledge to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        // pass time.   to voting period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountTwo });
        
        await ContestETHOnlyMockInstance.delegate(accountTwo, stageID, { from: accountOne});
        
        
    });    

    it('should revoke on revoking period', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        const revokeFee = (await ContestETHOnlyMockInstance.getRevokeFee({from: accountOne}));
        const accountFourthStartingBalance = (await web3.eth.getBalance(accountFourth));
        
        
        // make some pledge to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        let pledgeTxObj = await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        // pass time.   to revoking period
        await helper.advanceTime(20);
        
        // make revoke 
        let revokeTxObj = await ContestETHOnlyMockInstance.revoke(stageID, { from: accountFourth});
        
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
  
    it('should revoke on voting period with gradually increased revoke penalty', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        const revokeFee = (await ContestETHOnlyMockInstance.getRevokeFee({from: accountOne}));
        const accountFourthStartingBalance = (await web3.eth.getBalance(accountFourth));
        
        
        // make some pledge to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(3*oneEther).toString(16) });
        let pledgeTxObj = await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        
        // pass time.   to voting period
        // 5 seconds since start voting period. and 1 second for block "advanceTimeAndBlock"
        await helper.advanceTimeAndBlock(15);
        let revokeFeeperSecond = BigNumber(revokeFee).div(BigNumber(10)); // 10 seconds is voting period

        // make revoke 
        let revokeTxObj = await ContestETHOnlyMockInstance.revoke(stageID, { from: accountFourth});
        
        const accountFourthEndingBalance = (await web3.eth.getBalance(accountFourth));

        assert.notEqual(new BN(accountFourthStartingBalance,16).toString(16), new BN(accountFourthEndingBalance,16).toString(16), "Balance after revoke is equal" );
        
        let pledgeTx = await web3.eth.getTransaction(pledgeTxObj.tx);
        let revokeTx = await web3.eth.getTransaction(revokeTxObj.tx);

        let actual = (new BN(accountFourthEndingBalance,10)).toString(16);
        let expected = (
            // starting balance
            BigNumber(accountFourthStartingBalance)
            // revoke fee 
            .minus(
                BigNumber(1*oneEther).times(
                    BigNumber(revokeFeeperSecond).times(BigNumber(5+1)).div(BigNumber(1000000))
                )
            )
            // consuming for pledge transaction 
            .minus(
                BigNumber(pledgeTxObj["receipt"].gasUsed).times(BigNumber(pledgeTx.gasPrice))
                )
            // consuming for revoke transaction 
            .minus(
                BigNumber(revokeTxObj["receipt"].gasUsed).times(BigNumber(revokeTx.gasPrice))
                )
            ).toString(16);

        assert.equal(
            actual, 
            expected, 
            "Wrong revokeFee consuming"
        );
        
    });  
    
    it('Stage Workflow: should get correct prizes for winners&losers', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountNine });
        
        
        // make some pledge 11ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(3*oneEther).toString(16), stageID, { from: accountTwo, value:'0x'+(3*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountThree, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, { from: accountOne}));
        assert.equal(
            new BN((11*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass time.   to voting period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, { from: accountOne});
        await ContestETHOnlyMockInstance.vote(accountSix, stageID, { from: accountTwo});
        await ContestETHOnlyMockInstance.vote(accountSeven, stageID, { from: accountThree});
        await ContestETHOnlyMockInstance.vote(accountEight, stageID, { from: accountFourth});
        await ContestETHOnlyMockInstance.vote(accountNine, stageID, { from: accountTen});
        
        // pass time.   to complete period
        await helper.advanceTime(20);
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountNine});
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
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass 10 time.   to voting period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, { from: accountOne});
        await ContestETHOnlyMockInstance.vote(accountSix, stageID, { from: accountTwo});
        await ContestETHOnlyMockInstance.vote(accountSeven, stageID, { from: accountThree});
        await ContestETHOnlyMockInstance.vote(accountEight, stageID, { from: accountFourth});
        await ContestETHOnlyMockInstance.vote(accountNine, stageID, { from: accountTen});
        
        // pass time.   to complete period
        await helper.advanceTime(20);
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountNine});
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
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass time.   to voting period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, { from: accountOne});

        // pass time.   to complete period
        await helper.advanceTime(20);
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountNine});
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
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
																
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        
        // pass time.   to complete period
        await helper.advanceTime(30);
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, { from: accountOne});
        
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountNine});
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
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
        
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, { from: accountOne}),
            "Last stage have not ended yet"
        );
       
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        const stageNumberBefore = (await ContestETHOnlyMockInstance.getStageNumber( { from: accountOne}));
        
        // pass time.   to complete period
        await helper.advanceTime(30);
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, { from: accountOne});
        
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.claim(stageID, { from: accountFive}), 
            "Sender must be in contestant list"
        );
        
        
        const stageNumberAfter = (await ContestETHOnlyMockInstance.getStageNumber( { from: accountOne}));
        
        assert.equal(
            ((new BN(stageNumberBefore,10)).add(new BN(1,10))).toString(16),
            new BN(stageNumberAfter,10).toString(16),
            "Stage does not switch"
        );
    });

    it('Stage Workflow: test with delegation', async () => {
        let stageID = 0;
        var ContestETHOnlyMockInstance = await ContestETHOnlyMock.new();
        await ContestETHOnlyMockInstance.init(
                                                                3, // stagesCount,
                                                                ['0x'+(9*oneEther).toString(16),'0x'+(3*oneEther).toString(16),'0x'+(3*oneEther).toString(16)], // stagesMinAmount
                                                                10, // contestPeriodInSeconds,
                                                                10, // votePeriodInSeconds,
                                                                10, // revokePeriodInSeconds,
                                                                [50,30,10], //percentForWinners,
                                                                [] // judges
                                                                );
																
        await truffleAssert.reverts(
            ContestETHOnlyMockInstance.complete(stageID, { from: accountOne}),
            "Last stage have not ended yet"
        );
        // enter 
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountFive });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSix });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountSeven });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountEight });
        await ContestETHOnlyMockInstance.enter(stageID, { from: accountNine });
        
        
        // make some pledge 17ETH to reach minimum
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountOne, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountTwo, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(5*oneEther).toString(16), stageID, { from: accountThree, value:'0x'+(5*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountFourth, value:'0x'+(1*oneEther).toString(16) });
        await ContestETHOnlyMockInstance.pledgeETH('0x'+(1*oneEther).toString(16), stageID, { from: accountTen, value:'0x'+(1*oneEther).toString(16) });
        
        const stageAmount = (await ContestETHOnlyMockInstance.getStageAmount(stageID, { from: accountOne}));
        assert.equal(
            new BN((17*oneEther).toString(16),16).toString(16),
            new BN((stageAmount).toString(16),16).toString(16),
            "Wrong Stage amount"
        );
        // pass time.   to voting period
        await helper.advanceTime(10);
        
        await ContestETHOnlyMockInstance.vote(accountFive, stageID, { from: accountOne});
        await ContestETHOnlyMockInstance.vote(accountSix, stageID, { from: accountTwo});
        await ContestETHOnlyMockInstance.vote(accountSeven, stageID, { from: accountThree});
        await ContestETHOnlyMockInstance.delegate(accountThree, stageID, { from: accountFourth});
        await ContestETHOnlyMockInstance.delegate(accountThree, stageID, { from: accountTen});
        
        // pass time.   to complete period
        await helper.advanceTime(20);
        
        // call complete by owner
        await ContestETHOnlyMockInstance.complete(stageID, { from: accountOne});
 
        const accountFiveStartingBalance = (await web3.eth.getBalance(accountFive));
        const accountSixStartingBalance = (await web3.eth.getBalance(accountSix));
        const accountSevenStartingBalance = (await web3.eth.getBalance(accountSeven));
        const accountEightStartingBalance = (await web3.eth.getBalance(accountEight));
        const accountNineStartingBalance = (await web3.eth.getBalance(accountNine));
        
        //claim 5
        let claim5TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountFive});
        let claim5Tx = await web3.eth.getTransaction(claim5TxObj.tx);
        
        //claim 6
        let claim6TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSix});
        let claim6Tx = await web3.eth.getTransaction(claim6TxObj.tx);
        
        //claim 7
        let claim7TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountSeven});
        let claim7Tx = await web3.eth.getTransaction(claim7TxObj.tx);
        
        //claim 8
        let claim8TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountEight});
        let claim8Tx = await web3.eth.getTransaction(claim8TxObj.tx);
        
        //claim 9
        let claim9TxObj = await ContestETHOnlyMockInstance.claim(stageID, { from: accountNine});
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

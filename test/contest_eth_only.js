const { ethers} = require('hardhat');
const { expect } = require('chai');
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");

const mixedCall = require('../js/mixedCall.js');
const { 
    deploy
} = require("./fixtures/deploy.js");

const ONE_ETH = ethers.parseEther('1');

describe("ContestETHOnly", function () {

    describe("Simple tests", function () {

        it('should disable recieve() method', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                ContestETHOnlyInstance
            } = res;

            const amountETHSendToContract = ONE_ETH; // 1ETH

            // send ETH to Contract
            await expect(
                accountOne.sendTransaction({
                    to: ContestETHOnlyInstance.target, 
                    value: amountETHSendToContract
                })
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'MethodDoesNotSupported');
            
        });

        it('should enter in active stage', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                stageID,
                ContestETHOnlyInstance
            } = res;

            await ContestETHOnlyInstance.connect(accountOne).enter(stageID);
            // revert if trying to double enter
            await expect(
                ContestETHOnlyInstance.connect(accountOne).enter(stageID)
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'MustNotBeInContestantList').withArgs(stageID, accountOne.address);
        });
        
        it('should leave in active stage if entered before', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                stageID,
                ContestETHOnlyInstance
            } = res;

            await ContestETHOnlyInstance.connect(accountOne).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).leave(stageID);
            // revert if trying to double leave
            await expect(
                ContestETHOnlyInstance.connect(accountOne).leave(stageID)
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'MustBeInContestantList').withArgs(stageID, accountOne.address);
        });

        it('should prevent pledge if entered before', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                stageID,
                ContestETHOnlyInstance
            } = res;

            await ContestETHOnlyInstance.connect(accountOne).enter(stageID);
            // revert if trying to double enter
            await expect(
                ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value: ONE_ETH}),
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'MustNotBeInContestantList').withArgs(stageID, accountOne.address);
        });

        it('should pledge before and during contestPeriod', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                accountTwo,
                stageID,
                ContestETHOnlyInstance
            } = res;

            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value: ONE_ETH});
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
        });

        it('should prevent pledge in voting or revoking periods', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                stageID,
                minAmountInFirstStage,
                ContestETHOnlyInstance
            } = res;

            // make some pledge to reach minimum                                                                
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInFirstStage, stageID, {value: minAmountInFirstStage });

            // pass time.   to voting period
            await time.increase(100);
            // await ethers.provider.send('evm_increaseTime', [100]);
            // await ethers.provider.send('evm_mine');
            
            // try to pledge again
            await expect(
                ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value: ONE_ETH })
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'StageIsOutOfContestPeriod').withArgs(stageID);
            
            // pass another 10 seconds. to revoke period
            // await ethers.provider.send('evm_increaseTime', [100]);
            // await ethers.provider.send('evm_mine');
            await time.increase(100);
            
            // try to pledge again
            await expect(
                ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value: ONE_ETH })
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'StageIsOutOfContestPeriod').withArgs(stageID);
        });

        it('should prevent double vote ', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                accountTwo,
                stageID,
                minAmountInStage,
                minAmountInFirstStage,
                ContestETHOnlyInstance
            } = res;

            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInFirstStage, stageID, {value:minAmountInFirstStage });
            
            // pass time.   to voting period
            await time.increase(100);

            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID);
            await expect(
                ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID)
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'PersonMustHaveNotVotedOrDelegatedBefore').withArgs(accountOne.address, stageID);
        });

        it('should prevent vote outside of voting period', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                accountTwo,
                accountThree,
                accountFourth,
                stageID,
                minAmountInStage,
                minAmountInFirstStage,
                ContestETHOnlyInstance
            } = res;

            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInFirstStage, stageID, {value:minAmountInFirstStage });
            await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            
            await expect(
                ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID)
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'StageIsOutOfVotingPeriod').withArgs(stageID);
            
            // pass time.   to voting period
            await time.increase(100);
            
            await expect(
                ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID)
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'MustBeInContestantList').withArgs(stageID, accountTwo.address);
            
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID);
            
            // pass time again. to revoke period
            await time.increase(100);
            
            await ContestETHOnlyInstance.connect(accountThree).enter(stageID);
            await expect(
                ContestETHOnlyInstance.connect(accountFourth).vote(accountThree.address, stageID),
            ).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'StageIsOutOfVotingPeriod').withArgs(stageID);
        });

        it('should delegate to some1', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                accountTwo,
                accountFourth,
                stageID,
                minAmountInStage,
                minAmountInFirstStage,
                ContestETHOnlyInstance
            } = res;

            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInFirstStage, stageID, {value:minAmountInFirstStage });
            await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            
            // pass time.   to voting period
            await time.increase(100);
            
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).delegate(accountTwo.address, stageID);
        });    

        it('should revoke on revoking period', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                accountTwo,
                accountThree,
                accountFourth,
                stageID,
                minAmountInStage,
                minAmountInFirstStage,
                ContestETHOnlyInstance
            } = res;
            
            const accountFourthStartingBalance = await ethers.provider.getBalance(accountFourth.address);

            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInFirstStage, stageID, {value:minAmountInFirstStage });

            let pledgeTxObj = await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });

            // pass time.   to revoking period
            await time.increase(200);

            // make revoke 
            const revokeFee = await ContestETHOnlyInstance.revokeFee();

            let revokeTxObj = await ContestETHOnlyInstance.connect(accountFourth).revoke(stageID);

            const accountFourthEndingBalance = await ethers.provider.getBalance(accountFourth.address);

            expect(accountFourthStartingBalance).not.to.be.eq(accountFourthEndingBalance);

            let pledgeTx = await pledgeTxObj.wait();
            let revokeTx = await revokeTxObj.wait();

            let actual = accountFourthEndingBalance;
            let expected = (
                // starting balance
                (accountFourthStartingBalance)
                // revoke fee 
                - ONE_ETH * revokeFee / 1000000n
                // consuming for pledge transaction 
                - pledgeTx.gasUsed * pledgeTx.gasPrice
                // consuming for revoke transaction 
                - revokeTx.gasUsed * revokeTx.gasPrice
            );
            expect(actual).to.be.eq(expected);
            
        });  

        it('should revoke on voting period with gradually increased revoke penalty', async () => {
            const res = await loadFixture(deploy);
            const {
                accountOne,
                accountFourth,
                stageID,
                minAmountInStage,
                minAmountInFirstStage,
                ContestETHOnlyInstance
            } = res;
            
            const revokeFee = await ContestETHOnlyInstance.revokeFee();
            const accountFourthStartingBalance = await ethers.provider.getBalance(accountFourth.address);
            
            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInFirstStage, stageID, {value:minAmountInFirstStage });
            var timestampStageTurnActive = (await ethers.provider.getBlock('latest')).timestamp;            

            let pledgeTxObj = await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });


            // pass time.   to voting period
            // 50 seconds since start voting period. and 2 seconds for blocks: "evm_increaseTime" and "evm_mine"
            await time.increase(150);

            let revokeFeeperSecond = revokeFee / 100n; // 100 seconds is voting period

            // make revoke 
            let revokeTxObj = await ContestETHOnlyInstance.connect(accountFourth).revoke(stageID);
            var timestampRevoke = (await ethers.provider.getBlock('latest')).timestamp;

            const accountFourthEndingBalance = await ethers.provider.getBalance(accountFourth.address);

            expect(accountFourthStartingBalance).not.to.be.eq(accountFourthEndingBalance);
            
            let pledgeTx = await pledgeTxObj.wait();
            let revokeTx = await revokeTxObj.wait();
            
            
            // calculate pass seconds with out setting timestamp on block.
            // just calculate time between starting voting period and calling revoke
            // here passing 150 seconds on `time.increase` -- all left it's extraseconds
            var additionalSeconds = (timestampRevoke-timestampStageTurnActive)-150;

            let actual = accountFourthEndingBalance;
            let expected = (
                // starting balance
                (accountFourthStartingBalance)
                // revoke fee 
                - ONE_ETH * revokeFeeperSecond * (50n+BigInt(additionalSeconds)) / 1000000n
                // consuming for pledge transaction 
                - pledgeTx.gasUsed * pledgeTx.gasPrice
                // consuming for revoke transaction 
                - revokeTx.gasUsed * revokeTx.gasPrice
            );

            expect(actual).to.be.eq(expected);
            
        });  
        describe("TrustedForwarder", function () {
            it("should be empty after init", async() => {
                const res = await loadFixture(deploy);
                const {
                    accountOne,
                    ContestETHOnlyInstance
                } = res;
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(ethers.ZeroAddress)).to.be.true;
            });

            it("should be setup by owner", async() => {
                const res = await loadFixture(deploy);
                const {
                    owner,
                    accountOne,
                    accountTwo,
                    ContestETHOnlyInstance
                } = res;
                await expect(ContestETHOnlyInstance.connect(accountOne).setTrustedForwarder(accountTwo.address)).to.be.revertedWith("Ownable: caller is not the owner");
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(ethers.ZeroAddress)).to.be.true;
                await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(accountTwo.address);
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(accountTwo.address)).to.be.true;
            });
            
            it("should drop trusted forward if trusted forward become owner ", async() => {
                const res = await loadFixture(deploy);
                const {
                    owner,
                    accountOne,
                    accountTwo,
                    ContestETHOnlyInstance
                } = res;

                await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(accountTwo.address);
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(accountTwo.address)).to.be.true;
                await ContestETHOnlyInstance.connect(owner).transferOwnership(accountTwo.address);
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(ethers.ZeroAddress)).to.be.true;
            });

            it("shouldnt become owner and trusted forwarder", async() => {
                const res = await loadFixture(deploy);
                const {
                    owner,
                    ContestETHOnlyInstance
                } = res;

                await expect(ContestETHOnlyInstance.connect(owner).setTrustedForwarder(owner.address)).to.be.revertedWithCustomError(ContestETHOnlyInstance, 'ForwarderCanNotBeOwner');
            });
            
        });
        
    });


    async function getCases() {
        const res = await loadFixture(deploy);
        const {
            owner,
            accountOne,
            accountTwo,
            accountThree,
            accountFourth,
            accountFive,
            accountSix,
            accountSeven,
            accountEight,
            accountNine,
            accountTen,
            accountEleven,
            trustedForwarder,
            stageID,
            ContestETHOnlyInstance
        } = res;
        const CASES = [
            {
                title: 'should get correct prizes for winners&losers',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,5n * (ONE_ETH)],
                    [accountTwo,3n * (ONE_ETH)],
                    [accountThree,ONE_ETH],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[
                    [accountOne,accountFive],
                    [accountTwo,accountSix],
                    [accountThree,accountSeven],
                    [accountFourth,accountEight],
                    [accountTen,accountNine]
                ],
                delegating:[],
                claiming: [
                    [accountFive,   50n],
                    [accountSix,    30n],
                    [accountSeven,  10n],
                    [accountEight,  5n],
                    [accountNine,   5n],
                ],
                claimingDenominator:1n
            },
            {
                title: 'winners\'s same weights(order by entering)',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,5n * (ONE_ETH)],
                    [accountTwo,5n * (ONE_ETH)],
                    [accountThree,5n * (ONE_ETH)],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[
                    [accountOne,accountFive],
                    [accountTwo,accountSix],
                    [accountThree,accountSeven],
                    [accountFourth,accountEight],
                    [accountTen,accountNine]
                ],
                delegating:[],
                claiming: [
                    [accountFive,   50n],
                    [accountSix,    30n],
                    [accountSeven,  10n],
                    [accountEight,  5n],
                    [accountNine,   5n],
                ],
                claimingDenominator:1n
            },
            {
                title: 'the one winner with 3 contest\'s prizes',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,5n * (ONE_ETH)],
                    [accountTwo,5n * (ONE_ETH)],
                    [accountThree,5n * (ONE_ETH)],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[
                    [accountOne,accountFive]
                ],
                delegating:[],
                claiming: [
                    [accountFive,   5000n],
                    [accountSix,    1250n],
                    [accountSeven,  1250n],
                    [accountEight,  1250n],
                    [accountNine,   1250n],
                ],
                claimingDenominator:100n
            },
            {
                title: 'there are no winners',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,5n * (ONE_ETH)],
                    [accountTwo,5n * (ONE_ETH)],
                    [accountThree,5n * (ONE_ETH)],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[],
                delegating:[],
                claiming: [
                    [accountFive,   20n],
                    [accountSix,    20n],
                    [accountSeven,  20n],
                    [accountEight,  20n],
                    [accountNine,   20n],
                ],
                claimingDenominator:1n
            },
            {
                title: 'there are no entered',
                entered: [],
                pledged: [
                    [accountOne,5n * (ONE_ETH)],
                    [accountTwo,3n * (ONE_ETH)],
                    [accountThree,ONE_ETH],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[],
                delegating:[],
                claiming: [
                    [accountFive,   50n, `MustBeInContestantList(0, "${accountFive.address}")`],
                    [accountSix,    30n, `MustBeInContestantList(0, "${accountSix.address}")`],
                    [accountSeven,  10n, `MustBeInContestantList(0, "${accountSeven.address}")`],
                    [accountEight,  5n, `MustBeInContestantList(0, "${accountEight.address}")`],
                    [accountNine,   5n, `MustBeInContestantList(0, "${accountNine.address}")`],
                ],
                claimingDenominator:1n,
                checkStageSwitchNumber: true
            },
            {
                title: 'test with delegation',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,5n * (ONE_ETH)],
                    [accountTwo,5n * (ONE_ETH)],
                    [accountThree,5n * (ONE_ETH)],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[
                    [accountOne,accountFive],
                    [accountTwo,accountSix],
                    [accountThree,accountSeven],
                ],
                delegating:[
                    [accountFourth,accountThree],
                    [accountTen,accountThree]
                ],
                claiming: [
                    [accountFive,   30n],
                    [accountSix,    10n],
                    [accountSeven,  50n],
                    [accountEight,  5n],
                    [accountNine,   5n],
                ],
                claimingDenominator:1n
            },

        ];
        return CASES;
    }

    for (const trustedForwardMode of [false, true]) {

    describe(`${trustedForwardMode ? '[trusted forwarder]' : ''} Stage Workflow`, function () {
        
        it('shouldnt complete until stage have not ended yet', async () => {
            const res = await loadFixture(deploy);
            const {
                owner,
                trustedForwarder,
                stageID,
                ContestETHOnlyInstance
            } = res;
            if (trustedForwardMode) {
                await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(trustedForwarder.address);
            }
            await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, owner, 'complete(uint256)', [stageID], `StageHaveNotEndedYet`, [stageID]);
        }); 


        for(let uid in [0,1,2,3,4,5]) {
            it('Test'+uid, async function() {
                
                const cases = await getCases();
                const element = cases[uid];

                this.test.title = element.title;

                const res = await loadFixture(deploy);
                const {
                    owner,
                    trustedForwarder,
                    stageID,
                    ContestETHOnlyInstance
                } = res;

                if (trustedForwardMode) {
                    await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(trustedForwarder.address);
                }

                // enter 
                for (const acc of element.entered) {
                    await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, acc, 'enter(uint256)', [stageID]);
                };

                var totalPledged = 0n;
                // make some pledge X ETH to reach minimum
                for (const item of element.pledged) {
                    totalPledged = totalPledged + item[1];
                    await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, item[0], 'pledgeETH(uint256,uint256)', [item[1], stageID, {value:item[1] }]);
                };

                const stageAmount = await ContestETHOnlyInstance.getStageAmount(stageID);
                expect(totalPledged).to.be.eq(stageAmount);

                const stageNumberBefore = await ContestETHOnlyInstance.getStageNumber();

                // pass time.   to voting period
                // await ethers.provider.send('evm_increaseTime', [100]);
                // await ethers.provider.send('evm_mine');
                await time.increase(100);

                //voting
                for (const item of element.voting) {
                    await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, item[0], 'vote(address,uint256)', [item[1].address, stageID]);
                };
                //delegating
                for (const item of element.delegating) {
                    await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, item[0], 'delegate(address,uint256)', [item[1].address, stageID]);
                };

                // pass time.   to complete period
                // await ethers.provider.send('evm_increaseTime', [200]);
                // await ethers.provider.send('evm_mine');
                await time.increase(200);

                // call complete by owner
                await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, owner, 'complete(uint256)', [stageID]);

                //calculations
                for (const item of element.claiming) {

                    if (typeof(item[2]) !== 'undefined') {
                        //catch Error
                        await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, item[0], 'claim(uint256)', [stageID], 'MustBeInContestantList', [stageID, item[0].address]);
                    } else {
                        let startingBalance = await ethers.provider.getBalance(item[0].address);
                                            
                        let txObj = await mixedCall(ContestETHOnlyInstance,trustedForwarder, trustedForwardMode, item[0], 'claim(uint256)', [stageID]);
                        let tx = await txObj.wait();

                        let endingBalance = await ethers.provider.getBalance(item[0].address);
                        //reward
                        expect(
                            totalPledged * item[1] / 100n / element.claimingDenominator
                        ).to.be.eq(
                            
                            (trustedForwardMode === false) ? (
                                
                                endingBalance - (startingBalance) + (tx.gasUsed * tx.gasPrice)
                            ):(
                                // via transfer forwarder calls fee payed by forwarder
                                endingBalance - startingBalance
                            )
                            
                        )
                    }
                };


                const stageNumberAfter = await ContestETHOnlyInstance.getStageNumber();

                if ((typeof(element.checkStageSwitchNumber) !== 'undefined') && element.checkStageSwitchNumber == true) {
                    expect(stageNumberBefore + 1n).to.be.eq(stageNumberAfter)
                }
                // etc.
            });
        }

    }); 
    }
    
}); 

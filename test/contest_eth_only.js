const { ethers, waffle } = require('hardhat');
const { BigNumber } = require('ethers');
const { expect } = require('chai');
const chai = require('chai');
const { time } = require('@openzeppelin/test-helpers');
const mixedCall = require('../js/mixedCall.js');

const ZERO = BigNumber.from('0');
const ONE = BigNumber.from('1');
const TWO = BigNumber.from('2');
const THREE = BigNumber.from('3');
const FOUR = BigNumber.from('4');
const FIVE = BigNumber.from('5');
const SIX = BigNumber.from('6');
const SEVEN = BigNumber.from('7');
const NINE = BigNumber.from('9');
const TEN = BigNumber.from('10');
const ELEVEN = BigNumber.from('11');
const HUNDRED = BigNumber.from('100');
const THOUSAND = BigNumber.from('1000');
const MILLION = BigNumber.from('1000000');


const ONE_ETH = ethers.utils.parseEther('1');

//const TOTALSUPPLY = ethers.utils.parseEther('1000000000');    
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';
const NO_COSTMANAGER = ZERO_ADDRESS;

describe("ContestETHOnly", function () {
    const accounts = waffle.provider.getWallets();
    
    // Setup accounts.
    const owner = accounts[0];                     
    const accountOne = accounts[1];  
    const accountTwo = accounts[2];
    const accountThree= accounts[3];
    const accountFourth = accounts[4];
    const accountFive = accounts[5];
    const accountSix = accounts[6];
    const accountSeven = accounts[7];
    const accountEight = accounts[8];
    const accountNine = accounts[9];
    const accountTen = accounts[10];
    const accountEleven = accounts[11];
    const trustedForwarder = accounts[12];
    
    // setup useful vars
    
    var ContestETHOnlyF;
    var ContestFactoryFactory;
    
    var ContestETHOnlyInstance;
    var ReleaseManagerFactoryF;
    var ReleaseManagerF;

    var stageID;
    var snapId;
    var  minAmountInStage;
    beforeEach("deploying", async() => {

        // make snapshot before time manipulations
        snapId = await ethers.provider.send('evm_snapshot', []);

        ContestETHOnlyF = await ethers.getContractFactory("ContestETHOnly");
        ContestFactoryFactory = await ethers.getContractFactory("ContestFactory");
        ReleaseManagerFactoryF= await ethers.getContractFactory("MockReleaseManagerFactory")
        ReleaseManagerF = await ethers.getContractFactory("MockReleaseManager");
        //console.log(`beforeEach("deploying"`);
    });

    
    afterEach("deploying", async() => { 
        // restore snapshot
        await ethers.provider.send('evm_revert', [snapId]);
        //console.log(`afterEach("deploying"`);
    });

    describe("Simple tests", function () {
        beforeEach("deploying", async() => {
            let implementationReleaseManager    = await ReleaseManagerF.deploy();
            let releaseManagerFactory   = await ReleaseManagerFactoryF.connect(owner).deploy(implementationReleaseManager.address);
            let tx,rc,event,instance,instancesCount;
            //
            tx = await releaseManagerFactory.connect(owner).produce();
            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceProduced');
            [instance, instancesCount] = event.args;
            let releaseManager = await ethers.getContractAt("MockReleaseManager",instance);

            stageID = 0;
            minAmountInStage = THREE.mul(ONE_ETH);

            // let timePeriod = 60*24*60*60;
            // timestamps = [blockTime+(2*timePeriod), blockTime+(4*timePeriod), blockTime+(6*timePeriod)];
            // prices = [100000, 150000, 180000]; // (0.0010/0.0015/0.0018)  mul by 1e8. 0.001 means that for 1 eth got 1000 tokens    //_00000000
            // lastTime = parseInt(blockTime)+(8*timePeriod);

            let contestFactory = await ContestFactoryFactory.connect(owner).deploy(NO_COSTMANAGER);
            // 
            const factoriesList = [contestFactory.address];
            const factoryInfo = [
                [
                    1,//uint8 factoryIndex; 
                    1,//uint16 releaseTag; 
                    "0x53696c766572000000000000000000000000000000000000"//bytes24 factoryChangeNotes;
                ]
            ]
            await contestFactory.connect(owner).registerReleaseManager(releaseManager.address);
            await releaseManager.connect(owner).newRelease(factoriesList, factoryInfo);

            tx = await contestFactory.connect(owner).produceETHOnly(
                3, // stagesCount,
                [minAmountInStage,minAmountInStage,minAmountInStage], // stagesMinAmount
                100, // contestPeriodInSeconds,
                100, // votePeriodInSeconds,
                100, // revokePeriodInSeconds,
                [50,30,10], //percentForWinners,
                [] // judges   
            );

            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceCreated');
            [instance,] = event.args;

            ContestETHOnlyInstance = await ethers.getContractAt("ContestETHOnly",instance);   

            // ContestETHOnlyInstance = await ContestETHOnlyF.connect(owner).deploy();
            // await ContestETHOnlyInstance.connect(owner).init(
            //     3, // stagesCount,
            //     [minAmountInStage,minAmountInStage,minAmountInStage], // stagesMinAmount
            //     100, // contestPeriodInSeconds,
            //     100, // votePeriodInSeconds,
            //     100, // revokePeriodInSeconds,
            //     [50,30,10], //percentForWinners,
            //     [] // judges
            // );
        });

        it('should disable recieve() method', async () => {
            const amountETHSendToContract = ONE_ETH; // 1ETH
            // send ETH to Contract
            await expect(
                accountOne.sendTransaction({
                    to: ContestETHOnlyInstance.address, 
                    value: amountETHSendToContract
                })
            ).to.be.revertedWith("Method does not support. Send ETH with pledgeETH() method");
            
        });

        it('should enter in active stage', async () => {
            await ContestETHOnlyInstance.connect(accountOne).enter(stageID);
            // revert if trying to double enter
            await expect(
                ContestETHOnlyInstance.connect(accountOne).enter(stageID)
            ).to.be.revertedWith("Sender must not be in contestant list");
        });
        
        it('should leave in active stage if entered before', async () => {
            await ContestETHOnlyInstance.connect(accountOne).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).leave(stageID);
            // revert if trying to double leave
            await expect(
                ContestETHOnlyInstance.connect(accountOne).leave(stageID)
            ).to.be.revertedWith("Sender must be in contestant list");
        });

        it('should prevent pledge if entered before', async () => {
            await ContestETHOnlyInstance.connect(accountOne).enter(stageID);
            // revert if trying to double enter
            await expect(
                ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH}),
            ).to.be.revertedWith("Sender must not be in contestant list");
        });

        it('should pledge before and during contestPeriod', async () => {
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
        });

        it('should prevent pledge in voting or revoking periods', async () => {

            // make some pledge to reach minimum                                                                
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });

            // pass time.   to voting period
            await ethers.provider.send('evm_increaseTime', [100]);
            await ethers.provider.send('evm_mine');
            
            // try to pledge again
            await expect(
                ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH })
            ).to.be.revertedWith("Stage is out of contest period");
            
            // pass another 10 seconds. to revoke period
            await ethers.provider.send('evm_increaseTime', [100]);
            await ethers.provider.send('evm_mine');
            
            // try to pledge again
            await expect(
                ContestETHOnlyInstance.connect(accountOne).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH })
            ).to.be.revertedWith("Stage is out of contest period");
        });

        it('should prevent double vote ', async () => {
            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInStage, stageID, {value:minAmountInStage });
            
            // pass time.   to voting period
            await ethers.provider.send('evm_increaseTime', [100]);
            await ethers.provider.send('evm_mine');
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID);
            await expect(
                ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID)
            ).to.be.revertedWith("must have not voted or delegated before");
        });

        it('should prevent vote outside of voting period', async () => {
            
            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInStage, stageID, {value:minAmountInStage });
            await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            
            await expect(
                ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID)
            ).to.be.revertedWith("Stage is out of voting period");
            
            // pass time.   to voting period
            await ethers.provider.send('evm_increaseTime', [100]);
            await ethers.provider.send('evm_mine');
            
            await expect(
                ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID)
            ).to.be.revertedWith("contestantAddress must be in contestant list");
            
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
            
            
            await ContestETHOnlyInstance.connect(accountOne).vote(accountTwo.address, stageID);
            
            // pass time again. to revoke period
            await ethers.provider.send('evm_increaseTime', [100]);
            await ethers.provider.send('evm_mine');
            
            await ContestETHOnlyInstance.connect(accountThree).enter(stageID);
            await expect(
                ContestETHOnlyInstance.connect(accountFourth).vote(accountThree.address, stageID),
            ).to.be.revertedWith("Stage is out of voting period");
        });

        it('should delegate to some1', async () => {
            
            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInStage, stageID, {value:minAmountInStage });
            await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            
            // pass time.   to voting period
            await ethers.provider.send('evm_increaseTime', [100]);
            await ethers.provider.send('evm_mine');
            
            await ContestETHOnlyInstance.connect(accountTwo).enter(stageID);
            await ContestETHOnlyInstance.connect(accountOne).delegate(accountTwo.address, stageID);
        });    

        it('should revoke on revoking period', async () => {
            
            const revokeFee = await ContestETHOnlyInstance.revokeFee();
            const accountFourthStartingBalance = await ethers.provider.getBalance(accountFourth.address);
            
            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInStage, stageID, {value:minAmountInStage });
            let pledgeTxObj = await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            
            // pass time.   to revoking period
            await ethers.provider.send('evm_increaseTime', [200]);
            await ethers.provider.send('evm_mine');
            
            // make revoke 
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
                .sub(
                    ONE_ETH.mul(revokeFee).div(MILLION)
                )
                // consuming for pledge transaction 
                .sub(
                    ONE.mul(pledgeTx.gasUsed).mul(pledgeTx.effectiveGasPrice)
                    )
                // consuming for revoke transaction 
                .sub(
                    ONE.mul(revokeTx.gasUsed).mul(revokeTx.effectiveGasPrice)
                    )
                );

            expect(actual).to.be.eq(expected);
            
        });  

        it('should revoke on voting period with gradually increased revoke penalty', async () => {
            
            const revokeFee = await ContestETHOnlyInstance.revokeFee();
            const accountFourthStartingBalance = await ethers.provider.getBalance(accountFourth.address);
            
            // make some pledge to reach minimum
            await ContestETHOnlyInstance.connect(accountOne).pledgeETH(minAmountInStage, stageID, {value:minAmountInStage });
            let pledgeTxObj = await ContestETHOnlyInstance.connect(accountFourth).pledgeETH(ONE_ETH, stageID, {value:ONE_ETH });
            
            // pass time.   to voting period
            // 50 seconds since start voting period. and 2 seconds for blocks: "evm_increaseTime" and "evm_mine"
            await ethers.provider.send('evm_increaseTime', [150]);
            await ethers.provider.send('evm_mine');

            let revokeFeeperSecond = revokeFee.div(HUNDRED); // 100 seconds is voting period

            // make revoke 
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
                .sub(
                    ONE_ETH.mul(revokeFeeperSecond).mul(50+2).div(MILLION)
                )
                // consuming for pledge transaction 
                .sub(
                    ONE.mul(pledgeTx.gasUsed).mul(pledgeTx.effectiveGasPrice)
                )
                // consuming for revoke transaction 
                .sub(
                    ONE.mul(revokeTx.gasUsed).mul(revokeTx.effectiveGasPrice)
                )
            );

            expect(actual).to.be.eq(expected);
            
        });  
        describe("TrustedForwarder", function () {
            it("should be empty after init", async() => {
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(ZERO_ADDRESS)).to.be.true;
            });

            it("should be setup by owner", async() => {
                await expect(ContestETHOnlyInstance.connect(accountOne).setTrustedForwarder(accountTwo.address)).to.be.revertedWith("Ownable: caller is not the owner");
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(ZERO_ADDRESS)).to.be.true;
                await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(accountTwo.address);
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(accountTwo.address)).to.be.true;
            });
            
            it("should drop trusted forward if trusted forward become owner ", async() => {
                await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(accountTwo.address);
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(accountTwo.address)).to.be.true;
                await ContestETHOnlyInstance.connect(owner).transferOwnership(accountTwo.address);
                expect(await ContestETHOnlyInstance.connect(accountOne).isTrustedForwarder(ZERO_ADDRESS)).to.be.true;
            });

            it("shouldnt become owner and trusted forwarder", async() => {
                await expect(ContestETHOnlyInstance.connect(owner).setTrustedForwarder(owner.address)).to.be.revertedWith("FORWARDER_CAN_NOT_BE_OWNER");
            });
            
        });
        
    });

    for (const trustedForwardMode of [false,trustedForwarder]) {

    describe(`${trustedForwardMode ? '[trusted forwarder]' : ''} Stage Workflow`, function () {
        beforeEach("deploying", async() => {
            let implementationReleaseManager    = await ReleaseManagerF.deploy();
            let releaseManagerFactory   = await ReleaseManagerFactoryF.connect(owner).deploy(implementationReleaseManager.address);
            let tx,rc,event,instance,instancesCount;
            //
            tx = await releaseManagerFactory.connect(owner).produce();
            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceProduced');
            [instance, instancesCount] = event.args;
            let releaseManager = await ethers.getContractAt("MockReleaseManager",instance);


            stageID = 0;
            minAmountInStage = THREE.mul(ONE_ETH);

            
            // let timePeriod = 60*24*60*60;
            // timestamps = [blockTime+(2*timePeriod), blockTime+(4*timePeriod), blockTime+(6*timePeriod)];
            // prices = [100000, 150000, 180000]; // (0.0010/0.0015/0.0018)  mul by 1e8. 0.001 means that for 1 eth got 1000 tokens    //_00000000
            // lastTime = parseInt(blockTime)+(8*timePeriod);

            let contestFactory = await ContestFactoryFactory.connect(owner).deploy(NO_COSTMANAGER);

            // 
            const factoriesList = [contestFactory.address];
            const factoryInfo = [
                [
                    1,//uint8 factoryIndex; 
                    1,//uint16 releaseTag; 
                    "0x53696c766572000000000000000000000000000000000000"//bytes24 factoryChangeNotes;
                ]
            ]
            await contestFactory.connect(owner).registerReleaseManager(releaseManager.address);
            await releaseManager.connect(owner).newRelease(factoriesList, factoryInfo);

            tx = await contestFactory.connect(owner).produceETHOnly(
                3, // stagesCount,
                [NINE.mul(ONE_ETH),THREE.mul(ONE_ETH),THREE.mul(ONE_ETH)], // stagesMinAmount
                100, // contestPeriodInSeconds,
                100, // votePeriodInSeconds,
                100, // revokePeriodInSeconds,
                [50,30,10], //percentForWinners,
                [] // judges
            );

            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceCreated');
            [instance,] = event.args;

            ContestETHOnlyInstance = await ethers.getContractAt("ContestETHOnly",instance);   
            // ContestETHOnlyInstance = await ContestETHOnlyF.connect(owner).deploy();
            // await ContestETHOnlyInstance.connect(owner).init(
            //     3, // stagesCount,
            //     [NINE.mul(ONE_ETH),THREE.mul(ONE_ETH),THREE.mul(ONE_ETH)], // stagesMinAmount
            //     100, // contestPeriodInSeconds,
            //     100, // votePeriodInSeconds,
            //     100, // revokePeriodInSeconds,
            //     [50,30,10], //percentForWinners,
            //     [] // judges
            // );

            if (trustedForwardMode) {
                await ContestETHOnlyInstance.connect(owner).setTrustedForwarder(trustedForwarder.address);
            }
        });
        it('shouldnt complete until stage have not ended yet', async () => {
            await mixedCall(ContestETHOnlyInstance, trustedForwardMode, owner, 'complete(uint256)', [stageID], "Last stage have not ended yet");
        }); 
        

        let testData = [
            {
                title: 'should get correct prizes for winners&losers',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,FIVE.mul(ONE_ETH)],
                    [accountTwo,THREE.mul(ONE_ETH)],
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
                    [accountFive,   50],
                    [accountSix,    30],
                    [accountSeven,  10],
                    [accountEight,  5],
                    [accountNine,   5],
                ],
                claimingDenominator:1
            },
            {
                title: 'winners\'s same weights(order by entering)',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,FIVE.mul(ONE_ETH)],
                    [accountTwo,FIVE.mul(ONE_ETH)],
                    [accountThree,FIVE.mul(ONE_ETH)],
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
                    [accountFive,   50],
                    [accountSix,    30],
                    [accountSeven,  10],
                    [accountEight,  5],
                    [accountNine,   5],
                ],
                claimingDenominator:1
            },
            {
                title: 'the one winner with 3 contest\'s prizes',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,FIVE.mul(ONE_ETH)],
                    [accountTwo,FIVE.mul(ONE_ETH)],
                    [accountThree,FIVE.mul(ONE_ETH)],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[
                    [accountOne,accountFive]
                ],
                delegating:[],
                claiming: [
                    [accountFive,   5000],
                    [accountSix,    1250],
                    [accountSeven,  1250],
                    [accountEight,  1250],
                    [accountNine,   1250],
                ],
                claimingDenominator:100
            },
            {
                title: 'there are no winners',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,FIVE.mul(ONE_ETH)],
                    [accountTwo,FIVE.mul(ONE_ETH)],
                    [accountThree,FIVE.mul(ONE_ETH)],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[],
                delegating:[],
                claiming: [
                    [accountFive,   20],
                    [accountSix,    20],
                    [accountSeven,  20],
                    [accountEight,  20],
                    [accountNine,   20],
                ],
                claimingDenominator:1
            },
            {
                title: 'there are no entered',
                entered: [],
                pledged: [
                    [accountOne,FIVE.mul(ONE_ETH)],
                    [accountTwo,THREE.mul(ONE_ETH)],
                    [accountThree,ONE_ETH],
                    [accountFourth,ONE_ETH],
                    [accountTen,ONE_ETH]
                ],
                voting:[],
                delegating:[],
                claiming: [
                    [accountFive,   50, "Sender must be in contestant list"],
                    [accountSix,    30, "Sender must be in contestant list"],
                    [accountSeven,  10, "Sender must be in contestant list"],
                    [accountEight,  5, "Sender must be in contestant list"],
                    [accountNine,   5, "Sender must be in contestant list"],
                ],
                claimingDenominator:1,
                checkStageSwitchNumber: true
            },
            {
                title: 'test with delegation',
                entered: [accountFive, accountSix, accountSeven, accountEight, accountNine],
                pledged: [
                    [accountOne,FIVE.mul(ONE_ETH)],
                    [accountTwo,FIVE.mul(ONE_ETH)],
                    [accountThree,FIVE.mul(ONE_ETH)],
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
                    [accountFive,   30],
                    [accountSix,    10],
                    [accountSeven,  50],
                    [accountEight,  5],
                    [accountNine,   5],
                ],
                claimingDenominator:1
            },

        ];
      

        testData.forEach(element => {
            
            it(element.title, async () => {
                // enter 
                for (const acc of element.entered) {
                    await mixedCall(ContestETHOnlyInstance, trustedForwardMode, acc, 'enter(uint256)', [stageID]);
                };

                var totalPledged = ZERO;
                // make some pledge X ETH to reach minimum
                for (const item of element.pledged) {
                    totalPledged = totalPledged.add(item[1]);
                    await mixedCall(ContestETHOnlyInstance, trustedForwardMode, item[0], 'pledgeETH(uint256,uint256)', [item[1], stageID, {value:item[1] }]);
                };

                const stageAmount = await ContestETHOnlyInstance.getStageAmount(stageID);
                expect(totalPledged).to.be.eq(stageAmount);
                
                const stageNumberBefore = await ContestETHOnlyInstance.getStageNumber();

                // pass time.   to voting period
                await ethers.provider.send('evm_increaseTime', [100]);
                await ethers.provider.send('evm_mine');

                //voting
                for (const item of element.voting) {
                    await mixedCall(ContestETHOnlyInstance, trustedForwardMode, item[0], 'vote(address,uint256)', [item[1].address, stageID]);
                };
                //delegating
                for (const item of element.delegating) {
                    await mixedCall(ContestETHOnlyInstance, trustedForwardMode, item[0], 'delegate(address,uint256)', [item[1].address, stageID]);
                };

                // pass time.   to complete period
                await ethers.provider.send('evm_increaseTime', [200]);
                await ethers.provider.send('evm_mine');

                // call complete by owner
                await mixedCall(ContestETHOnlyInstance, trustedForwardMode, owner, 'complete(uint256)', [stageID]);

                //calculations
                for (const item of element.claiming) {

                    if (typeof(item[2]) !== 'undefined') {
                        //catch Error
                        await mixedCall(ContestETHOnlyInstance, trustedForwardMode, item[0], 'claim(uint256)', [stageID], "Sender must be in contestant list");
                    } else {
                        let startingBalance = await ethers.provider.getBalance(item[0].address);
                                            
                        let txObj = await mixedCall(ContestETHOnlyInstance, trustedForwardMode, item[0], 'claim(uint256)', [stageID]);
                        let tx = await txObj.wait();

                        let endingBalance = await ethers.provider.getBalance(item[0].address);
                        //reward
                        expect(
                            totalPledged.mul(item[1]).div(100).div(element.claimingDenominator)
                        ).to.be.eq(
                            (trustedForwardMode === false) ? (
                                endingBalance.sub(startingBalance).add(
                                    ONE.mul(tx.gasUsed).mul(tx.effectiveGasPrice)
                                )
                            ):(
                                // via transfer forwarder calls fee payed by forwarder
                                endingBalance.sub(startingBalance)
                            )
                            
                        )
                    }
                };

                
                const stageNumberAfter = await ContestETHOnlyInstance.getStageNumber();
                
                if ((typeof(element.checkStageSwitchNumber) !== 'undefined') && element.checkStageSwitchNumber == true) {
                    expect(stageNumberBefore.add(1)).to.be.eq(stageNumberAfter)
                }
            
            });

        });
    }); 
    }
}); 

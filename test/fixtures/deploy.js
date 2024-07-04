
async function deploy()  {
    const [
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
        trustedForwarder
    ] = await ethers.getSigners()

    const ContestF = await ethers.getContractFactory("Contest");
    const ContestETHOnlyF = await ethers.getContractFactory("ContestETHOnly");
    const ContestFactoryF = await ethers.getContractFactory("ContestFactory");
    const ReleaseManagerFactoryF= await ethers.getContractFactory("ReleaseManagerFactory")
    const ReleaseManagerF = await ethers.getContractFactory("ReleaseManager");

    const implementationReleaseManager    = await ReleaseManagerF.deploy();
    const releaseManagerFactory   = await ReleaseManagerFactoryF.connect(owner).deploy(implementationReleaseManager.target);
    let tx,rc,event,instance,instancesCount;
    //
    tx = await releaseManagerFactory.connect(owner).produce();
    rc = await tx.wait(); // 0ms, as tx is already confirmed
    event = rc.logs.find(event => event.fragment && event.fragment.name === 'InstanceProduced');
    [instance, instancesCount] = event.args;
    const releaseManager = await ethers.getContractAt("ReleaseManager",instance);

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const stageID = 0;
    const minAmountInStage = ethers.parseEther('3')//3n.mul(ONE_ETH);
    const NO_COSTMANAGER = ZERO_ADDRESS;

    // let timePeriod = 60*24*60*60;
    // timestamps = [blockTime+(2*timePeriod), blockTime+(4*timePeriod), blockTime+(6*timePeriod)];
    // prices = [100000, 150000, 180000]; // (0.0010/0.0015/0.0018)  mul by 1e8. 0.001 means that for 1 eth got 1000 tokens    //_00000000
    // lastTime = parseInt(blockTime)+(8*timePeriod);
    let contestImpl = await ContestF.deploy();
    let contestETHOnlyImpl = await ContestETHOnlyF.deploy();
    let contestFactory = await ContestFactoryF.connect(owner).deploy(
        contestImpl.target,
        contestETHOnlyImpl.target,
        NO_COSTMANAGER,
        releaseManager.target
    );
    // 
    const factoriesList = [contestFactory.target];
    const factoryInfo = [
        [
            7,//uint8 factoryIndex; 
            7,//uint16 releaseTag; 
            "0x53696c766572000000000000000000000000000000000000"//bytes24 factoryChangeNotes;
        ]
    ]

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
    event = rc.logs.find(event => event.fragment && event.fragment.name === 'InstanceCreated');
    [instance,] = event.args;

    const ContestETHOnlyInstance = await ethers.getContractAt("ContestETHOnly",instance);   
    return {
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
        //----
        ContestF,
        ContestETHOnlyF,
        ContestFactoryF,
        ReleaseManagerFactoryF,
        ReleaseManagerF,
        //----
        stageID,
        minAmountInStage,
        ZERO_ADDRESS,
        NO_COSTMANAGER,
        //----
        ContestETHOnlyInstance,
        releaseManagerFactory,
        releaseManager
    }
}

module.exports = {
    deploy
}
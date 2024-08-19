const fs = require('fs');
//const HDWalletProvider = require('truffle-hdwallet-provider');

function get_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.readFile('./scripts/arguments.json', (err, data) => {
            if (err) {
				
                if (err.code == 'ENOENT' && err.syscall == 'open' && err.errno == -4058) {
                    fs.writeFile('./scripts/arguments.json', "", (err2) => {
                        if (err2) throw err2;
                        resolve();
                    });
                    data = ""
                } else {
                    throw err;
                }
            }
    
            resolve(data);
        });
    });
}

function write_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.writeFile('./scripts/arguments.json', _message, (err) => {
            if (err) throw err;
            console.log('Data written to file');
            resolve();
        });
    });
}

async function main() {
	var data = await get_data();

    var data_object_root = JSON.parse(data);
	var data_object = {};
	if (typeof data_object_root[hre.network.name] === 'undefined') {
        data_object.time_created = Date.now()
    } else {
        data_object = data_object_root[hre.network.name];
    }
	//----------------

    const networkName = hre.network.name;

    var depl_local,
    depl_auxiliary,
    depl_releasemanager,
    depl_contest;

    var signers = await ethers.getSigners();
    if (networkName == 'hardhat') {
        depl_local = signers[0];
        depl_auxiliary = signers[0];
        depl_releasemanager = signers[0];
        depl_contest = signers[0];
    } else {
        [
            depl_local,
            depl_auxiliary,
            depl_releasemanager,
            depl_contest
        ] = signers;
    }

    const RELEASE_MANAGER = process.env.RELEASE_MANAGER;//hre.network.name == 'mumbai'? process.env.RELEASE_MANAGER_MUMBAI : process.env.RELEASE_MANAGER;
	console.log(
		"Deploying contracts with the account:",
		depl_auxiliary.address
	);

	// var options = {
	// 	//gasPrice: ethers.utils.parseUnits('50', 'gwei'), 
	// 	gasLimit: 10e6
	// };

	const deployerBalanceBefore = await ethers.provider.getBalance(depl_auxiliary.address);
    console.log("Account balance:", (deployerBalanceBefore).toString());

	const ContestF = await ethers.getContractFactory("Contest");
	const ContestETHOnlyF = await ethers.getContractFactory("ContestETHOnly");
	    
	let implementationContest           = await ContestF.connect(depl_auxiliary).deploy();
	let implementationContestETHOnly    = await ContestETHOnlyF.connect(depl_auxiliary).deploy();
	
    await implementationContest.waitForDeployment();
    await implementationContestETHOnly.waitForDeployment();

	console.log("Implementations:");
	console.log("  Contest deployed at:        ", implementationContest.target);
	console.log("  ContestETHOnly deployed at: ", implementationContestETHOnly.target);
    console.log("Linked with manager:");
    console.log("  Release manager:", RELEASE_MANAGER);

	data_object.implementationContest 	    = implementationContest.target;
	data_object.implementationContestETHOnly= implementationContestETHOnly.target;
    data_object.releaseManager	        = RELEASE_MANAGER;

    const deployerBalanceAfter = await ethers.provider.getBalance(depl_auxiliary.address);
    console.log("Spent:", ethers.formatEther(deployerBalanceBefore - deployerBalanceAfter));
    console.log("gasPrice:", ethers.formatUnits((await network.provider.send("eth_gasPrice")), "gwei")," gwei");

	//---
	const ts_updated = Date.now();
    data_object.time_updated = ts_updated;
    data_object_root[`${hre.network.name}`] = data_object;
    data_object_root.time_updated = ts_updated;
    let data_to_write = JSON.stringify(data_object_root, null, 2);
	//console.log(data_to_write);
    await write_data(data_to_write);

    if (networkName == 'hardhat') {
        console.log("skipping verifying for  'hardhat' network");
    } else {

        console.log("Starting verifying:");
        await hre.run("verify:verify", {address: implementationContest.target});
        await hre.run("verify:verify", {address: implementationContestETHOnly.target});
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });
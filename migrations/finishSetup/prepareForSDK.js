const _taquitoHelpers = require('../../test/helpers/taquito');
const _coreHelpers = require('../../scripts/helpers/core');
const { bob, carol } = require('../../scripts/sandbox/accounts');
const config = require('../../truffle-config');
const saveContractAddress = require('../../helpers/saveContractAddress');

async function setupTestOvenForTest(delegate, ovenOwner, coreHelper) {
    const { ovenHelpers, ovenAddress } = await coreHelper.createOven(
        delegate, 
        ovenOwner.pkh
    );

    if (delegate === null) {
        saveContractAddress('ovenWithOutDelegate', ovenAddress);
    } else {
        saveContractAddress('ovenWithDelegate', ovenAddress);
    }

    await ovenHelpers.default(100)
    await ovenHelpers.default(100)

    await _taquitoHelpers.setSigner(ovenOwner.sk);
    await ovenHelpers.withdraw(50)
    await ovenHelpers.withdraw(50)
    return 
}

module.exports = async (network) => {
    await _taquitoHelpers.initializeWithRpc(config.networks[network].host, config.networks[network].port);
    await _taquitoHelpers.setSigner(config.networks[network].secretKey);
    const coreHelper = await _coreHelpers.at(require('../../deployments/core'))
    
    const delegateKeyHash = bob.pkh;
    const ovenOwner = carol;
    await setupTestOvenForTest(delegateKeyHash, ovenOwner, coreHelper);
    const operation = await setupTestOvenForTest(null, ovenOwner, coreHelper);
    return operation
};

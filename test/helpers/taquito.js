const { InMemorySigner } = require('@taquito/signer');
const { Tezos } = require('@taquito/taquito');

module.exports = {
    initialize: async () => {
        const rpc = "http://localhost:8732";
        Tezos.setRpcProvider(rpc);
    },
    setSigner: async (secretKey) => {
        const signer = (await InMemorySigner.fromSecretKey(secretKey));
        Tezos.setSignerProvider(signer);
    },
    signAs: async (secretKey, fn) => {
        const oldSigner = Tezos.signer;
        const signer = (await InMemorySigner.fromSecretKey(secretKey));
        Tezos.setSignerProvider(signer);
        // run the function using the new temporary signer
        await fn();
        // revert the signer back to the old signer
        Tezos.setSignerProvider(oldSigner);
    }
}
const tzip7 = artifacts.require('tzip-7');
const { contractErrors } = require('./../../../helpers/constants');
const _cryptoHelpers = require('../../../helpers/crypto');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const _tzip7Helpers = require('../../helpers/tzip-7');
const accounts = require('./accounts');
const getDelayedISOTime = require('../../../helpers/getDelayedISOTime');

const { expect } = require('chai').use(require('chai-as-promised'));
const { TezosOperationError } = require('@taquito/taquito');

contract('TZIP-7 with bridge', () => {
    let helpers = {};
    let secretHash;
    let swapId;

    describe('Invoke %confirmSwap on bridge for an unconfirmed swap', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(accounts.sender.sk);    
            secretHash = _cryptoHelpers.randomHash();
            const swapInitiator = accounts.sender.pkh;
            // michelson pair
            swapId = {
                0: secretHash,
                1: swapInitiator
            }
            // deploy TZIP-7 instance with swap lock that is unconfirmed and has release time 60 min in the future
            const releaseTimeInFuture = getDelayedISOTime(60);
            const initialstorage = _tzip7InitialStorage.test.confirmSwap(swapId, false, releaseTimeInFuture);
            tzip7Instance = await tzip7.new(initialstorage);
            // display the current contract address for debugging purposes
            console.log('Originated token contract at:', tzip7Instance.address);

            helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
        });

        it("should be callable by initiator of swap", async () => {
            const operationPromise = helpers.tzip7.confirmSwap(secretHash);
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should change the swap property confirmed to true in storage', async () => {
            await helpers.tzip7.confirmSwap(secretHash);
            const swap = await helpers.tzip7.getSwap(swapId);
            expect(swap.confirmed).to.be.true;
        });

        it('should fail for the recipient to confirm', async () => {
            const operationPromise = _taquitoHelpers.signAs(accounts.recipient.sk, async () => {
                await helpers.tzip7.confirmSwap(secretHash);
            });
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.senderIsNotTheInitiator);
        });

        it('should fail for a third party', async () => {
            const operationPromise = _taquitoHelpers.signAs(accounts.thirdParty.sk, async () => {
                await helpers.tzip7.confirmSwap(secretHash);
            });
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.senderIsNotTheInitiator);
        });
    });

    describe('Invoke %confirmSwap on bridge for a confirmed swap', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            secretHash = _cryptoHelpers.randomHash();
            const swapInitiator = accounts.sender.pkh;
            // michelson pair
            swapId = {
                0: secretHash,
                1: swapInitiator
            }
            // deploy TZIP-7 instance with swap lock that is already confirmed and has release time in the future
            const releaseTimeInFuture = getDelayedISOTime(60);
            const initialstorage = _tzip7InitialStorage.test.confirmSwap(swapId, true, releaseTimeInFuture);
            tzip7Instance = await tzip7.new(initialstorage);
            // display the current contract address for debugging purposes
            console.log('Originated token contract at:', tzip7Instance.address);

            helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
        });
    
        it('should fail for an already confirmed swap', async () => {
            const operationPromise = helpers.tzip7.confirmSwap(secretHash);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapIsAlreadyConfirmed);
        });
    });

    describe('Invoke %confirmSwap on bridge for a swap past release time', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            secretHash = _cryptoHelpers.randomHash();
            const swapInitiator = accounts.sender.pkh;
            // michelson pair
            swapId = {
                0: secretHash,
                1: swapInitiator
            }
            // deploy TZIP-7 instance with an unconfirmed swap, but release time that is already passed
            const releaseTimeInPast = getDelayedISOTime(-60);
            const initialstorage = _tzip7InitialStorage.test.confirmSwap(swapId, false, releaseTimeInPast);
            tzip7Instance = await tzip7.new(initialstorage);
            // display the current contract address for debugging purposes
            console.log('Originated token contract at:', tzip7Instance.address);

            helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
        });
    
        it('should fail to confirm a swap past the release time', async () => {
            const operationPromise = helpers.tzip7.confirmSwap(secretHash);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapIsOver);
        });
    });
});

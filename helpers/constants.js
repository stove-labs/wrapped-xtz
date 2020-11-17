module.exports = {
    unit: undefined,
    rpcErrors: {
        michelson: {
            balanceTooLow: "proto.006-PsCARTHA.contract.balance_too_low"
        },
        proto: {
            unregistredDelegate: "(permanent) proto.006-PsCARTHA.contract.manager.unregistered_delegate"
        },
        http: {
            notFound: "Http error response: (404)"
        }
    },
    contractErrors: {
        tzip7: {
            noPermission: "NoPermission",
            notEnoughAllowance: "NotEnoughAllowance",
            notEnoughBalance: "NotEnoughBalance",
            swapLockAlreadyExists: "SwapLockAlreadyExists",
            swapLockDoesNotExist: "SwapLockDoesNotExist",
            tokenOperationsPaused: "TokenOperationsArePaused",
            tooLongSecret: "TooLongSecret",
            unsafeAllowanceChange: "UnsafeAllowanceChange",
        },
        core: {
            lambdaNotFound: '0',
            lambdaNotAnEntrypoint: '1',
            lambdaParameterWrongType: '2',
            amountNotZero: '4',
            ovenMissingDefaultEntrypoint: '5',
            ovenNotTrusted: '6',
            notAnOvenOwner: '14',
            ovenOwnerDoesNotAcceptDeposits: '15',
        },
    },
};
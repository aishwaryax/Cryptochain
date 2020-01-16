const Transaction = require('./transaction')
const Wallet = require('./index')
const {REWARD_INPUT, MINING_REWARD} = require('../config')

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount
    beforeEach(() => {
        senderWallet = new Wallet()
        recipient = 'recipient-public-key'
        amount = 50
        
        transaction = new Transaction({senderWallet, recipient, amount})
    })

    it('has an id', () => {
        expect(transaction).toHaveProperty('id')
    })

    describe('output map', () => {
        it('has an outputMap', () => {
            expect(transaction).toHaveProperty('outputMap')
        })

        it('outputs the amount to recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount)
        })

        it('outputs the remaining balance to the senderWallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount)
        })
    })

    describe('input', () => {

        it('has an input', () => {
            expect(transaction).toHaveProperty('input')
        })

        it('has a timestamp in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp')
        })

        it('sets the amount to the senderWallet balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance)
        })

        it('sets the address to the senderWallet publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey)
        })
    })

    describe('validTransaction', () => {

        let errorMock, logMock

        beforeEach(() => {
            errorMock = jest.fn()
            global.console.error = errorMock
        })
        describe('transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true)
            })
        })

        describe('transaction is invalid', () => {
            describe('and transaction outputMap is invalid', () => {
                it('returns false and logs an error', () => {

                    transaction.outputMap[senderWallet.publicKey] = 99999
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    expect(errorMock).toHaveBeenCalled
                })
            })

            describe('and transaction signature is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.input.signature = new Wallet().sign('invalid data')
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    expect(errorMock).toHaveBeenCalled
                })
            })
        })
    })

    describe('update()', () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    describe('rewardTransactions', () => {
      let rewardTransactions, minerWallet
      beforeEach(() => {
        minerWallet = new Wallet()
        rewardTransaction = Transaction.rewardTransaction({minerWallet})
      })

      it('creates reward for transaction', () => {
        expect(rewardTransaction.input).toEqual(REWARD_INPUT)
      })

      it('creates one transaction for the miner with the mining reward input', () => {
        expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD)
      })
    })
    
  });
})
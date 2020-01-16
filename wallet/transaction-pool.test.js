const TransactionPool = require('./transaction-pool')
const Transaction = require('./transaction')
const Wallet = require('./index')
const Blockchain = require('../blockchain')

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet
    beforeEach(() => {
        transactionPool = new TransactionPool()
        senderWallet = new Wallet()
        transaction = new Transaction({
            senderWallet,
            recipient: 'foo-rec', 
            amount: 50
        })
    })

    describe('setTransaction', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction)
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction)
        })
    })

    describe('existingTransaction', () => {
    it('returns an existing transaction given an input address', () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
      ).toBe(transaction);
    });

    describe('validTransactions', () => {
        let validTransactions
        beforeEach(() => {
            validTransactions = []
            for (let i = 1; i<=10; i++) {
                transaction = new Transaction({senderWallet, recipient: 'test-recipient', amount: 50})
                if(i % 3 === 0) {
                    transaction.input.amount = 9999999
                }
                else if(i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign('invalid-sign')
                }
                else {
                    validTransactions.push(transaction)
                }

                transactionPool.setTransaction(transaction)
                errorMock = jest.fn()
                global.console.error = errorMock
            }

            it('returns validTransaction', () => {
                expect(transactionPool.validTransactions()).toEqual(validTransactions)
            })

            it('logs error for invalid transaction', () => {
                transactionPool.validTransactions()
                expect(errorMock).toHaveBeencalled()
            })
        })
    })

    describe('clearTransactionPool', () => {
        it('and it clears transactions', () => {
            transactionPool.clear()
            expect(transactionPool.transactionMap).toEqual({})
        })
    })

    describe('clearBlockchainTransactionPool', () => {
        it('clears the pool of exisiting blockchain transaction', () => {
            const blockchain = new Blockchain()
            const expectedTransactionMap = {}

            for (let i=1; i<=6; i++) {
                const transaction = new Wallet().createTransaction({ recipient: 'foo', amount: 50})
                transactionPool.setTransaction(transaction)
                if (i%2 === 0) {
                    blockchain.addBlock({data: [transaction]})
                }
                else {
                    expectedTransactionMap[transaction.id] = transaction
                }

            }

            transactionPool.clearBlockchainTransactions({chain: blockchain.chain})
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap)
        })
    })
  });
})
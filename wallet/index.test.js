const Wallet = require('./index')
const { verifySignature } = require('../util')
const Transaction = require('./transaction')
const Blockchain = require('../blockchain')
const {STARTING_BALANCE} = require('../config')

describe('Wallet', () => {
    let wallet;
    beforeEach(() => {
        wallet = new Wallet()
    })
    it('has balance', () => {
        expect(wallet).toHaveProperty('balance')
    })
    it('has public key', () => {
        console.log(wallet.publicKey)
        expect(wallet).toHaveProperty('publicKey')
    })

    describe('data signing', () => {

        const data = 'foo-data'
        it('verifies signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data)
            })).toBe(true)
        })
        it('does not verify an invalid signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data)
            }))
        })
    })

    describe('createTransaction', () => {
        describe('and when the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({amount: 999999, recipient: 'foo-recipient'})).toThrow('Amount exceeds balance')
            })
        })

        describe('and the transaction amount is valid', () => {

            let transaction, amount, recipient
            beforeEach(() => {
                amount = 50
                recipient = 'foo-recipient'
                transaction = wallet.createTransaction({amount, recipient})
            })
            it('creates a transaction', () => {
                expect(transaction instanceof Transaction).toBe(true)
            })
            it('matches transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey)
            })
            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            })
        })

        describe('and chain is passed', () => {
            it('and calculate wallet balance is called', () => {
                const calclateBalanceMock = jest.fn()
                originalCalculateBalance = Wallet.calculateBalance
                Wallet.calculateBalance = calclateBalanceMock
                wallet.createTransaction({recipient: 'foo', amount: 50, chain: new Blockchain().chain})
                expect(calclateBalanceMock).toHaveBeenCalled()
                Wallet.calculateBalance = originalCalculateBalance
            })
        })
    })

    describe('calculateBalance', () => {
        let blockchain
        beforeEach(() => {
            blockchain = new Blockchain()
        })
        describe('and there are no output transactions for the wallet', () => {
            it('returns the STARTING_BALANCE', () => {
                expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})).toEqual(STARTING_BALANCE)
            })
        })

        describe('and there are output transactions for the wallet', () => {
            let transactionOne, transactionTwo
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({recipient: wallet.publicKey, amount: 50})
                transactionTwo = new Wallet().createTransaction({recipient: wallet.publicKey, amount: 45})
                blockchain.addBlock({data: [transactionOne, transactionTwo]})
            })
            it('adds the sum of all output transactions to the wallet', () => {
                 expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})).toEqual(STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey])
            })
        })

        describe('and wallet has made a transaction', () => {
            let recentTransaction
            beforeEach(() => {
                recentTransaction = wallet.createTransaction({
                    recipient: 'foo-rec',
                    amount: 50
                })

                blockchain.addBlock({data:[recentTransaction]})
            })
            it('returns output amount of recent transaction', () => {
                expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})).toEqual(recentTransaction.outputMap[wallet.publicKey])
            })

            describe('and there are outputs next to and after the recentTransaction', () => {
                let sameBlockTransaction, nextBlockTransaction
                beforeEach(() => {                    

                    recentTransaction = wallet.createTransaction({recipient: 'rec1', amount: 60})
                    sameBlockTransaction = Transaction.rewardTransaction({minerWallet: wallet})
                    blockchain.addBlock({data: [recentTransaction, sameBlockTransaction]})

                    nextBlockTransaction = new Wallet().createTransaction({recipient: wallet.publicKey, amount: 100})
                    blockchain.addBlock({data: [nextBlockTransaction]})
                })

                

                it('includes the output amounts in the wallet balance', () => {
                    expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey}))
                    .toEqual(
                        recentTransaction.outputMap[wallet.publicKey] + 
                        sameBlockTransaction.outputMap[wallet.publicKey] +
                        nextBlockTransaction.outputMap[wallet.publicKey]
                    )
                })
            })
        })
    })
})
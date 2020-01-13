const Wallet = require('./index')
const { verifySignature } = require('../util')
const Transaction = require('./transaction')

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
    })
})
const Transaction = require('./transaction')
const Wallet = require('./index')

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

    describe('and the amount is invalid', () => {
      it('throws an error', () => {
        expect(() => {
          transaction.update({
            senderWallet, recipient: 'foo', amount: 999999
          })
        }).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      beforeEach(() => {
        originalSignature = transaction.input.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextRecipient = 'next-recipient';
        nextAmount = 50;
  
        transaction.update({
          senderWallet, recipient: nextRecipient, amount: nextAmount
        });
      });
  
      it('outputs the amount to the next recipient', () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
      });
  
      it('subtracts the amount from the original sender output amount', () => {
        expect(transaction.outputMap[senderWallet.publicKey])
          .toEqual(originalSenderOutput - nextAmount);
      });
  
      it('maintains a total output that matches the input amount', () => {
        expect(
          Object.values(transaction.outputMap)
            .reduce((total, outputAmount) => total + outputAmount)
        ).toEqual(transaction.input.amount);
      });
  
      it('re-signs the transaction', () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });

      describe('and another update for the same recipient', () => {
        let addedAmount;

        beforeEach(() => {
          addedAmount = 80;
          transaction.update({
            senderWallet, recipient: nextRecipient, amount: addedAmount
          });
        });

        it('adds to the recipient amount', () => {
          expect(transaction.outputMap[nextRecipient])
            .toEqual(nextAmount + addedAmount);
        });

        it('subtracts the amount from the original sender output amount', () => {
          expect(transaction.outputMap[senderWallet.publicKey])
            .toEqual(originalSenderOutput - nextAmount - addedAmount);
        });
      });
    });
  });
})
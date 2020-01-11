const Blockchain = require('./blockchain')
const Block = require('./block')

describe('blockchain', () => {
    let blockchain, newChain, originalChain
    beforeEach(() => {
        blockchain = new Blockchain()
        newChain = new Blockchain()
        originalChain = blockchain.chain
    })
    it('blockchain is an array', () => {
        expect(blockchain.chain instanceof Array).toBe(true)
    })

    it('blockchain has first block as genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })

    it('blockchains newly added data is actual data', () => {
        const newData = 'foo-data'
        blockchain.addBlock({data: newData})
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData)
    })

    describe('isValidChain()', () => {
        describe('when the chain doesnt start with genesis block', () => {
            it('returns false', ()=> {
                blockchain.chain[0] = {data: 'fake-gen-data'}
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            })
        })
        describe('when the chain starts with genesis block and has multiple blocks', () => {
            beforeEach(()=> {
                    blockchain.addBlock({data: 'one'})
                    blockchain.addBlock({data: 'two'})
                    blockchain.addBlock({data: 'three'})
            })
            describe('lastHash value has changed', () => {
                it('returns false', ()=> {
                     
                    blockchain.chain[2].hash = 'broken-last-hash'
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })
            describe('hash value has changed', () => {
                it('returns false', ()=> {
                    blockchain.chain[2].data = 'data-is-changed'
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })
            describe('no change in block', () => {
                it('returns true', ()=> {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                    
                })
            })
        })
    })

    describe('replaceChain()', () => {
        let errorMock, logMock
        beforeEach(() => {
            errorMock = jest.fn()
            logMock = jest.fn()

            global.console.log = logMock
            global.console.error = errorMock
        })
        describe('when the chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'}
                blockchain.replaceChain(newChain.chain)
            })
            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain)
            })

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled()
            })
        })
        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: 'one'})
                newChain.addBlock({data: 'two'})
                newChain.addBlock({data: 'three'})

            })
            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash'
                    blockchain.replaceChain(newChain.chain)
                })
                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain)
                })

                it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled()
            })
            })
            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain)
                })
              it('replace the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain)
                })
                it('logs success for replacing chain', () => {
                    expect(logMock).toHaveBeenCalled()
                })
            })
        })
    })
})
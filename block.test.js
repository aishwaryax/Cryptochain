const Block = require('./block')
const GENESIS_DATA = require('./config')
const cryptoHash = require('./crypto-hash')

describe('block', () => {
    const timestamp = 'test-timestamp'
    const lastHash = 'test-lastHash'
    const hash = 'test-hash'
    const data = 'test-data'

    const block = new Block({timestamp, lastHash, hash, data})

    it('hasEverything', () => {
        expect(block.timestamp).toEqual(timestamp)
        expect(block.lastHash).toEqual(lastHash)
        expect(block.hash).toEqual(hash)
        expect(block.data).toEqual(data)
    })

    describe('genesis', () => {
    const genesisBlock = Block.genesis()
    console.log("gb", genesisBlock)

    it('genesis is block instance', () => {
        expect(genesisBlock instanceof Block).toBe(true)
    })

    it('genesis has genesis data', () => {
        expect(genesisBlock).toEqual(GENESIS_DATA)
    })
})

    describe('mineBlock', () => {
        const lastBlock = Block.genesis()
        const data = 'minedData'
        const minedBlock = Block.mineBlock({lastBlock, data})

        it('minedBlock is a block', () => {
            expect(minedBlock instanceof Block).toBe(true)
        })

        it('minedBlocks last hash is last blocks hash', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        })

        it('minedBlocks data is actual data', () => {
            expect(minedBlock.data).toEqual(data)
        })

        it('minedBlocks sets a timestamp', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined)
        })

        it('creates SHA 256 for an input', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data))
        })
    })
    

}) 

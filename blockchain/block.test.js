const Block = require('./block')
const {GENESIS_DATA, MINE_RATE} = require('../config')
const { cryptoHash } = require('../util')
const hexToBinary = require('hex-to-binary')

describe('block', () => {
    const timestamp = 2000
    const lastHash = 'test-lastHash'
    const hash = 'test-hash'
    const data = 'test-data'
    const nonce = 1
    const difficulty = 1

    const block = new Block({timestamp, nonce, difficulty, lastHash, hash, data})

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

        it('minedBlocks sets a timestamp', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty))
        })

        it('creates SHA 256 for an input', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, minedBlock.nonce, minedBlock.difficulty, lastBlock.hash, data))
        })

        it('adjusts difficulty as per mine rate', () => {
            const possibleDifficulties = [lastBlock.difficulty + 1, lastBlock.difficulty - 1]
            expect(possibleDifficulties.includes(minedBlock.difficulty)).toBe(true)
        })
    })

    describe('adjustDifficulty', () => {
        it('raises the difficulty level for quickly mined block', () => {
            expect(Block.adjustDifficulty({originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100})).toEqual(block.difficulty + 1)
        })

        it('lowers the difficulty level for quickly mined block', () => {
            expect(Block.adjustDifficulty({originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100})).toEqual(block.difficulty - 1)
        })

        it('never allows the difficulty to be less than 1', () => {
            block.difficulty = -1
            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1)
        })
    })
    

}) 

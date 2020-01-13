const cryptoHash = require('./crypto-hash')

describe('cryptoHash()', () => {
    it('generates SHA 256 output', () => {
        expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b')
        })

    it('hashed output is same even if arguments order changed', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('two', 'three', 'one'))
    })

    it('produces a unique hash when properties of an input have changed', () => {
        const foo = {}
        const originalHash = cryptoHash(foo)
        foo['a'] = 'a'
        expect(cryptoHash(foo)).not.toEqual(originalHash)
    })
})
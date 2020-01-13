const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet')

const app = express()
const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({blockchain, transactionPool})

const DEFAULT_PORT = 3000

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}/`

app.use(bodyParser.json())

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
    const {data} = req.body
    blockchain.addBlock({data})
    pubsub.broadcastChain()
    res.redirect('/api/blocks')
})

app.post('/api/transact', (req, res) => {
    const {amount, recipient} = req.body
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey })
    try {
        if (transaction) {
            console.log("going here")
            transaction.update({senderWallet: wallet, recipient, amount})
        }
        else {
            transaction = wallet.createTransaction({amount, recipient})
        }
    }
    catch(error) {
        //bad req as bal < amt
        return res.status(400).json({type: 'error', message: error.message})
    }

    transactionPool.setTransaction(transaction)
    pubsub.broadcastTransaction(transaction)
    console.log('transaction pool: ', transactionPool)
    res.json({ type: 'success', transaction })

})

app.get('/api/transaction-pool-map', (req, res) => {
  res.json(transactionPool.transactionMap);
});

const syncWithRootState = () => {
    console.log('sync chain method')
    request({url: `${ROOT_NODE_ADDRESS}api/blocks`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body)
            console.log("root chain with sync ", rootChain)
            blockchain.replaceChain(rootChain)
        }
    })

    request({url: `${ROOT_NODE_ADDRESS}api/transaction-pool-map`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body)
            console.log("root transaction pool map with sync ", rootTransactionPoolMap)
            transactionPool.setMap(rootTransactionPoolMap)
        }
    })
}

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT

app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState()
    }
})
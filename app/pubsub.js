const PubNub = require('pubnub')
const blockchain = require('../blockchain')

const credentials = {
    publishKey: 'pub-c-35d7425e-f3bb-4461-b3de-7d480574318f',
    subscribeKey: 'sub-c-7bee52b2-3533-11ea-bbf4-c6d8f98a95a1',
    secretKey: 'sec-c-ZGY0M2ZhMDgtMGMxNS00MzVjLThlZWQtNGRmOTA3Zjk1MDdm'
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub {
    constructor ({blockchain, transactionPool}) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.pubnub = new PubNub(credentials)
        this.pubnub.subscribe({channels: Object.values(CHANNELS)})
        this.pubnub.addListener(this.listener())
    }

    listener() {
        return {
            message: messageObject => {
            const { channel, message } = messageObject;

            console.log(`Message received. Channel: ${channel}. Message: ${message}`);
            const parsedMessage = JSON.parse(message);

            switch(channel) {
                case CHANNELS.BLOCKCHAIN:
                    this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({ 
                        chain: parsedMessage.chain 
                        })
                    })
                break
                case CHANNELS.BLOCKCHAIN:
                    this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions(
                        { chain: parsedMessage.chain })
                    })
                break
                default:
                    return;
                }
            }
        }
    }

    publish({channel, message}) {
        this.pubnub.publish({ message, channel})
    }

    broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

    broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub
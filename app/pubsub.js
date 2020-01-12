const PubNub = require('pubnub')
const blockchain = require('../blockchain')

const credentials = {
    publishKey: 'pub-c-35d7425e-f3bb-4461-b3de-7d480574318f',
    subscribeKey: 'sub-c-7bee52b2-3533-11ea-bbf4-c6d8f98a95a1',
    secretKey: 'sec-c-ZGY0M2ZhMDgtMGMxNS00MzVjLThlZWQtNGRmOTA3Zjk1MDdm'
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
    constructor ({blockchain}) {
        this.blockchain = blockchain
        this.pubnub = new PubNub(credentials)
        this.pubnub.subscribe({channels: Object.values(CHANNELS)})
        this.pubnub.addListener(this.listener())
    }

    listener() {
        return {
            message: messageObject => {
                const {channel, message} = messageObject
                console.log(`message received! message: ${message} channel: ${channel}`)
                const parsedMessage = JSON.parse(message)
                if (channel === CHANNELS.BLOCKCHAIN) {
                    this.blockchain.replaceChain(parsedMessage)
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
}

module.exports = PubSub
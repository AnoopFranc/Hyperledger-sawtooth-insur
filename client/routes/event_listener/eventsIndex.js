const { Stream } = require('sawtooth-sdk/messaging/stream');

const VALIDATOR_URL = "tcp://validator:4004";
const stream = new Stream(VALIDATOR_URL);
const {eventHandler, setSocket} = require('./eventHandler');
const {subscriptionHandler} = require('./subscriptionHandler');

const startEventListener = (socketConnection) => {
    console.log("starting event listener");
    setSocket(socketConnection);
    stream.connect(() => {
      stream.onReceive(eventHandler);
      subscriptionHandler(stream);
    })
}

module.exports = startEventListener
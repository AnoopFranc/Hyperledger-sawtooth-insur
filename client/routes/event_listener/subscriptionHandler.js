const _ = require('lodash');
const {
    Message,
    EventFilter,
    EventSubscription,
    ClientEventsSubscribeRequest,
    ClientEventsSubscribeResponse
  } = require('sawtooth-sdk/protobuf');
// const PREFIX = 'a4d219';
// const NULL_BLOCK_ID = '0000000000000000';


const subscriptionHandler = (stream) => {
    const blockSub = EventSubscription.create({
        eventType: 'sawtooth/block-commit'
      });
    const orderCreateSub = EventSubscription.create({
      eventType: 'cookiejarExchange/order-placed'
    });
    const orderAcceptSub = EventSubscription.create({
      eventType: 'cookiejarExchange/order-accepted'
    });
    const clientSubscriptionRequest = ClientEventsSubscribeRequest.encode({
            subscriptions: [blockSub, orderCreateSub, orderAcceptSub]
        }).finish();

    stream.send(
      Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
      clientSubscriptionRequest
    )
    .then((response) => {
        return ClientEventsSubscribeResponse.decode(response);
    })
    .then(decodedMessage => {
      const status = getSubscriptionStatus(decodedMessage);
      if (status !== 'OK') {
        throw new Error(`Validator responded with status "${status}"`)
      }
    })
}
  
const getSubscriptionStatus = (decodedResponse) => {
    // _.findKey is used here as an easy way to iterate the different "Status" properties
    // to find out which one matches with the current response (ie decodedResponse.status)
    // You can use plain javascript methods instead as well
    const status = _.findKey(ClientEventsSubscribeResponse.Status,
        val => val === decodedResponse.status);

    console.log("Subscription status is : ", status);
    return status;
}

module.exports = { subscriptionHandler }
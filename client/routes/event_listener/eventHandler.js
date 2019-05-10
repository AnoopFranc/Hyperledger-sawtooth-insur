'use strict'

const _ = require('lodash');
const {
    Message,
    EventList,
    StateChangeList
  } = require('sawtooth-sdk/protobuf')
let socket;

const setSocket = (currentSocket) => {
  socket = currentSocket;
}

// Handle event message received by stream
const eventHandler = (msg) => {
    // Check if the message is an event message
    if (isEventMessage(msg)) {
      console.log("Event message received \n", msg);
      console.log();
      // Get the list of events
      const events = getEventsFromMessage(msg);
      console.log("Events we got from the message \n", events)
      console.log();
      // Iterate over each event and process
      let blockNum;
      events.forEach(event => {
        if (isBlockCommitEvent(event)) {
          console.log("block-commit happened");
        } else if (isOrderCreateEvent(event) || isOrderAcceptEvent(event)) {
          socket.emit('orders-changed', event);
        }
      });    
    } else {
      console.warn('Received message of unknown type:', msg.messageType)
    }
  }

  const isEventMessage = (msg) => {
    return msg.messageType === Message.MessageType.CLIENT_EVENTS;
  }
  
  const getEventsFromMessage = (msg) => {
    return EventList.decode(msg.content).events;
  }
  
  const isBlockCommitEvent = (event) => {
    return event.eventType === 'sawtooth/block-commit';
  }

  const isOrderCreateEvent = (event) => {
    return event.eventType === 'cookiejarExchange/order-placed';
  }

  const isOrderAcceptEvent = (event) => {
    return event.eventType === 'cookiejarExchange/order-accepted';
  }

/*----------------------------------------------------*/


const sendBlockUpdate = event => {
    const blockData = getBlock(event);
    console.log("Block commit readable data", blockData);
    socket.emit('message', blockData);
}

   // Parse Block Commit Event
const getBlock = events => {
    const block = _.chain(events)
        //.find(e => e.eventType === 'sawtooth/block-commit')
        .get('attributes')
        .map(a => [a.key, a.value])
        .fromPairs()
        .value()
    return {
        blockNum: parseInt(block.block_num),
        blockId: block.block_id,
        stateRootHash: block.state_root_hash
    }
}
  
module.exports = { eventHandler, setSocket };
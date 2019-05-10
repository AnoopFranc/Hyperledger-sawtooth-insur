
const { Stream } = require('sawtooth-sdk/messaging/stream');

const { Message, EventFilter, EventList, EventSubscription, ClientEventsSubscribeRequest, ClientEventsSubscribeResponse } = require('sawtooth-sdk/protobuf');

const VALIDATOR_URL = "tcp://validator:4004";

var { UserClient } = require('./userClient');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');
const fs = require('fs');
var encoder = new TextEncoder('utf8');
var decoder = new TextDecoder('utf8');

// Creating an object of Stream class
const stream = new Stream(VALIDATOR_URL);

let socket;

const setSocket = (currentSocket) => {
    socket = currentSocket;
}

const startEventListener = (socketConnection) => {
    console.log("Starting EventListener.......");
    setSocket(socketConnection);
    stream.connect(() => {
        // Attaching handler function to stream using onReceive API of Stream class
        stream.onReceive(getEventsMessage);
        eventSubscribe(stream);
    })
}
// Returns the subscription request statuses
function checkStatus(response) {
    let msg = "";
    if (response.status === 0) {
        msg = 'Subscription : OK';
        // check why given here. could be for subscription works, but internal error.
    }
    else if (response.status === 1) {
        msg = 'Subscription : GOOD';
    }
    else {
        msg = 'Subscription failed!';
    }
    return msg;
}


// Event Message Handler
function getEventsMessage(message) {
    // Decoding message using EventList protobuf
    let eventList = EventList.decode(message.content).events;
    
    // Iterating through event lists for "block-commit" eventType using .map JS function
    eventList.map(async function (event) {
        if (event.eventType == 'sawtooth/block-commit') {
            console.log("Block-Commit Event triggered");
        }
        // Custom Registration Event
        else if (event.eventType == 'DOHTVPM/Registration') {
            console.log("Registration-Event triggered");
            socket.emit("Registration-Event", event);

        }
    });
}

function eventSubscribe(stream) {
    try {
        //stream from above declaration
        // URL = url of validator
        // Creating a subcription to Block-Commit
        const blockCommitSubscription = EventSubscription.create({
            eventType: 'sawtooth/block-commit'
        });
        const DonorRegistrationSubscription = EventSubscription.create({
            eventType: 'DOHTVPM/Registration',
            filters: [EventFilter.create({
                key: 'Action',
                matchString: 'Donor',
                filterType: EventFilter.FilterType.REGEX_ALL
            })]
        });
        const PatientRegistrationSubscription = EventSubscription.create({
            eventType: 'DOHTVPM/Registration',
            filters: [EventFilter.create({
                key: 'Action',
                matchString: 'Patient',
                filterType: EventFilter.FilterType.REGEX_ALL
            })]
        });
        const subscription_request = ClientEventsSubscribeRequest.encode({
            subscriptions: [blockCommitSubscription, DonorRegistrationSubscription, PatientRegistrationSubscription]
            // Subscribing to block-commit event, add custom event name in the array if using
        }).finish();

        // Decoding the response from the validator with ClientEventsSubscribeRespose protobuf
        stream.send(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST, subscription_request)
            .then(function (response) {
                // console.log("ClientEventsSubscribeResponse.decode(response): ", ClientEventsSubscribeResponse.decode(response));
                return ClientEventsSubscribeResponse.decode(response);
            })
            .then(function (decoded_Response) {
                console.log("CheckStatus: ", checkStatus(decoded_Response));
            })
    }
    catch (err) {
        console.log("Error in EventListener: ", err);
    }
}
module.exports = { startEventListener };

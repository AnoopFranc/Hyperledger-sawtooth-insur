'use strict'

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');// require the transaction module here from SDK

const {
  InvalidTransaction,
  InternalErrorpayloadActions
} = require('sawtooth-sdk/processor/exceptions')
const crypto = require('crypto')
const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')

const _hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)
var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')

var CJ_FAMILY_NAME = 'cookiejarExchange';
var CJ_NAMESPACE = _hash(CJ_FAMILY_NAME).substring(0,6);

const _decodeRequest = function(payload){
  var payloadActions = payload.toString().split('&,');
  var payloadDecoded = {
    action : payloadActions[0],
    quantity : payloadActions[1],
    pData : payloadActions[2]
  }
  return payloadDecoded;
}

const _getCookieJarAddress = function(PK) {
  return CJ_NAMESPACE + '00' + _hash(PK).substring(0, 62);
}

const _getExchangeOrderAddress = function(order) {
  return CJ_NAMESPACE + '01' + _hash(order).substring(0, 62);
}

const _setState = function(context, stateData, addresses) {
  let newStateMappings = {};
  addresses.forEach((address, index) => {
    let addressStateData = stateData[index];
    let newStateData = '';
    if(addressStateData) {
      newStateData = encoder.encode(addressStateData.toString());
    }
    newStateMappings = Object.assign({
      [address] : newStateData
    }, newStateMappings);
  })
  return context.setState(newStateMappings);
}

const bakeCookie = function(context, currentState, quantity, transactorAddress) {
  let newQuantity = 0;
  if(currentState == '' || currentState == null) {
    newQuantity = parseInt(quantity);
  } else {
    const oldQuantity = parseInt(decoder.decode(currentState));
    newQuantity = parseInt(quantity) + oldQuantity;
  }

  return _setState(
    context,
    [newQuantity],
    [transactorAddress] 
  );
}

const eatCookie = function(context, currentState, quantity, transactorAddress) {
  let newQuantity = 0;
  if(currentState == '' || currentState == null) {
    throw new InvalidTransaction("No cookies to eat");
  } else {
    const oldQuantity = parseInt(decoder.decode(currentState));
    if(parseInt(quantity) > oldQuantity) {
      throw new InvalidTransaction("Not enough cookies to eat");
    }
    newQuantity = oldQuantity - parseInt(quantity);
  }
  
  return _setState(
    context,
    [newQuantity],
    [transactorAddress]
  );
}

const placeCookieOrder = function(context, orderInfo, orderAddress, transactorState, transactorAddress) {
  let newOrder = JSON.stringify(orderInfo);

  const oldQuantityOrderer = parseInt(decoder.decode(transactorState));
  let newQuantityOrderer = oldQuantityOrderer || 0;

  if(orderInfo.type === 'buy') {
    if(newQuantityOrderer < orderInfo.count || newQuantityOrderer <= 0) {
      throw new InvalidTransaction("Not enough cookies to place a sell Order");
    } else {
      newQuantityOrderer -= orderInfo.count;
    }
  }

  context.addEvent(
    'cookiejarExchange/order-placed',
    [ ['order_address', orderAddress]]
  );

  return _setState(
    context,
    [newOrder, newQuantityOrderer],
    [orderAddress, transactorAddress]
  );
}

const acceptCookieOrder = function(context, currentOrder, transactorAddress, transactorState, orderAddress) {
  let currentOrderDecoded;
  if(!currentOrder.length) {
    throw new InvalidTransaction("No valid order found");
  } else {
    currentOrderDecoded = JSON.parse(decoder.decode(currentOrder));
    let orderQuantity = parseInt(currentOrderDecoded.count);

    const oldQuantityOfAcceptor = parseInt(decoder.decode(transactorState));
    let newQuantityOfAcceptor = oldQuantityOfAcceptor || 0;
    
    if(currentOrderDecoded.type === 'buy') {
      newQuantityOfAcceptor += orderQuantity;
      
      context.addEvent(
        'cookiejarExchange/order-accepted',
        [['order_address', orderAddress], ['transactor_address', transactorAddress]]
        )
        
      return _setState(
        context,
        [newQuantityOfAcceptor, null],
        [transactorAddress, orderAddress]
        );
      } 
    else if(currentOrderDecoded.type === 'sell') {
      
      if(orderQuantity > oldQuantityOfAcceptor) {
        throw new InvalidTransaction("Not enough cookies available to sell");
      }
      let ordererAddress = _getCookieJarAddress(currentOrderDecoded.from);
      if(transactorAddress == ordererAddress) {
        throw new InvalidTransaction("Sorry, you cannot accept your own order currently.")
      }
      newQuantityOfAcceptor -= orderQuantity;
      return context.getState([ordererAddress])
      .then(stateMapping => {
        let ordererState = stateMapping[ordererAddress];
        let newQuantityOfOrderer = 0;
        if(ordererState != null && ordererState != '') {
          newQuantityOfOrderer = parseInt(decoder.decode(ordererState));
        }
        newQuantityOfOrderer += orderQuantity;
        context.addEvent(
          'cookiejarExchange/order-accepted',
          [['order_address', orderAddress], ['transactor_address', transactorAddress]]
        )
        return _setState(
          context, 
          [newQuantityOfAcceptor, newQuantityOfOrderer, null], 
          [transactorAddress, ordererAddress, orderAddress]
        );
      })
    }
  }
}

const _getVerifiedOrder = function (orderInfo, transactorPK) {
  if(!orderInfo.count) {
    throw new InvalidTransaction("Invalid order - No cookie count specified for the order");
  } else {
    if(!orderInfo.price) {
      orderInfo.price = 1;
    }
    orderInfo.from = transactorPK;
    // We are just flipping the type of the order here
    // ie if I want to 'buy' cookies at a price, it should show up as offer to 'sell' at that price in the order listings
    orderInfo.type = (orderInfo.type === 'buy') ? 'sell' : 'buy';
  }
  return orderInfo;
}

const bakeOperation = function(bakeDetails) {
  const transactorAddress = _getCookieJarAddress(bakeDetails.signerPK);
  return bakeDetails.context.getState([transactorAddress])
  .then((stateMappings) => {
    const myState = stateMappings[transactorAddress];
    return bakeCookie(bakeDetails.context, myState, bakeDetails.update.quantity, transactorAddress);
  })
}

const eatOperation = function(eatDetails) {
  const transactorAddress = _getCookieJarAddress(eatDetails.signerPK);
  return eatDetails.context.getState([transactorAddress])
  .then((stateMappings) => {
    const myState = stateMappings[transactorAddress];
    return eatCookie(eatDetails.context, myState, eatDetails.update.quantity, transactorAddress);
  })
}

const orderOperation = function(orderDetails) {
  const exchangeOrder = _getVerifiedOrder(JSON.parse(orderDetails.update.pData), orderDetails.signerPK);
  // The hash of the order data is used for creating unique address for the order
  // The order hash with the namespace hash and a 01 location forms the full address for the order listing
  const orderAddress = _getExchangeOrderAddress(JSON.stringify(exchangeOrder));
  const transactorAddress = _getCookieJarAddress(orderDetails.signerPK);
  return orderDetails.context.getState([orderAddress, transactorAddress])
    .then((stateMappings) => {
      // const currentOrder = stateMappings[orderAddress];
      const transactorState = stateMappings[transactorAddress];
      return placeCookieOrder(orderDetails.context, exchangeOrder, orderAddress, transactorState, transactorAddress);
    })
}

const acceptOperation = function(acceptDetails) {
  const transactorAddress = _getCookieJarAddress(acceptDetails.signerPK);
  const orderAddress = JSON.parse(acceptDetails.update.pData).address;
  return acceptDetails.context.getState([orderAddress, transactorAddress])
    .then((stateMappings) => {
      const currentOrder = stateMappings[orderAddress];
      const transactorState = stateMappings[transactorAddress];
      return acceptCookieOrder(acceptDetails.context, currentOrder, transactorAddress, transactorState, orderAddress);
    })
}

// Write CH extends TH
class CookieJarHandler extends TransactionHandler {
  // Constructor
  constructor(){
    super(CJ_FAMILY_NAME, ['1.0'], [CJ_NAMESPACE]);
  }

  // apply function
  apply(txProcessRequest, context) {
    const payload = txProcessRequest.payload;
    const update = _decodeRequest(payload);
    console.log("payload", update);
    const signerPK = txProcessRequest.header.signerPublicKey;
    let operationToExecute;
    let operationParameters;
    // Bake cookie
    if(update.action == 'bake') {
      const bakeDetails = {
        context : context,
        update: update,
        signerPK : signerPK
      }
      operationToExecute = bakeOperation;
      operationParameters = bakeDetails;
    // Eat cookie
    } else if(update.action == 'eat') {
        const eatDetails = {
          context : context,
          update: update,
          signerPK : signerPK
        }
        operationToExecute = eatOperation;
        operationParameters = eatDetails;
    // Place an order in the cookie exchange
    } else if(update.action == 'order') {
      const orderDetails = {
        context : context,
        update : update,
        signerPK : signerPK
      }
      operationToExecute = orderOperation;
      operationParameters = orderDetails;
    // Accept an order in the cookie exchange
    } else if(update.action == 'accept') {
      const accpetDetails = {
        context : context,
        update : update,
        signerPK : signerPK
      }
      operationToExecute = acceptOperation;
      operationParameters = accpetDetails;
    }
    return operationToExecute(operationParameters);
  }
}


module.exports = CookieJarHandler;// Module name here

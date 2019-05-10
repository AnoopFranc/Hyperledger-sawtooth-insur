/* Transaction Processor */
const {TextEncoder,TextDecoder} = require('text-encoding/lib/encoding')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { TransactionProcessor } = require('sawtooth-sdk/processor');
const crypto = require('crypto');
const {
    InvalidTransaction,
    InternalErrorpayloadActions
  } = require('sawtooth-sdk/processor/exceptions')

var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')


// function to hash data
function hash(data) {
    return crypto.createHash('sha512').update(data).digest('hex');
}





const FAMILY_NAME = "Vehicle Chain"
const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);
const URL = 'tcp://validator:4004';




function _getAddressToStore(action,Policynum){
   
    let keyHash  = hash(Policynum)
    console.log(keyHash)
    let nameHash = hash("Vehicle Chain")
    if(action === "New Policy"){
        return nameHash.slice(0,6) +'00' +keyHash.slice(0,62)
    } 
    else if(action === "Claim"){
        return nameHash.slice(0,6) +'01' +keyHash.slice(0,62)
    }
    else if(action === "Police Complain"){
        return nameHash.slice(0,6) +'02' +keyHash.slice(0,62)
    }
    }

    function writeToStore(context, address, data){
        dataBytes = encoder.encode(data)
        let entries = {
        [address]: dataBytes
      }
    return context.setState(entries);
    
    }


function addpolicy (context,action,name,Linum,Polnum) {
    console.log("addpolicy tp function")
    let address =_getAddressToStore(action,Polnum)
    console.log(address);
    let Policy_Details =[name,Linum,Polnum]
    return context.getState([address]).then(function(data){
        console.log("data",data)
        if(data[address] == null || data[address] == "" || data[address] == []){
            return writeToStore(context,address,Policy_Details)
        }
        else{
            throw new InvalidTransaction("Policy already exists");
        }
    })
}




function claimPolicy(context,action,name,LiNum,Polnum){
    console.log("claimimg policy")
    let address = _getAddressToStore("New Policy",Polnum)
    console.log(LiNum)
    console.log(address)
    let claimAddress =_getAddressToStore(action,Polnum)
    console.log(claimAddress)
    return context.getState([address]).then(function(data){
    console.log("data",data)
    if(data[address] == null || data[address] == "" || data[address] == []){
        console.log("Policy Doesnt Exist!")
    }else{
    let claim_data =[name,LiNum,Polnum]
    return writeToStore(context,claimAddress,claim_data)
    }
    })
        

    
}



function policecomplaint(context,action,name,LiNum,Policynum){
    console.log("Police Complaint registering")
    let complainAddress =_getAddressToStore(action,Policynum)
    let insurAddress    =_getAddressToStore("New Policy",Policynum)
    return context.getState([insurAddress]).then(function(data){
    console.log("data",data)
    let decodedData = decoder.decode(data[insurAddress]);
    let readableData = decodedData.toString().split(',');
    console.log("Name in complaint",readableData[0])
    if(data[insurAddress] == null || data[insurAddress] == "" || data[insurAddress] == []){
        console.log("Policy Doesnt Exist!")
    }else if(readableData[0] === name && readableData[1] === LiNum){
        let status = "pending";
        let complain_data =[name,LiNum,Policynum,status]
        return writeToStore(context,complainAddress,complain_data)
        }else{
            throw new InvalidTransaction("Policy doesnt Match Complain");
        }
        })   
}


function claimApprovel(context,verdict,policynum){
    console.log("approving policy")
    let address =_getAddressToStore("Police Complain",policynum)
    return context.getState([address]).then(function(data){
        console.log("data",data)
        let decodedData = decoder.decode(data[address]);
        console.log("decoded",decodedData)
        let readableData = decodedData.toString().split(',');
        console.log("readable",readableData)
         if(verdict === "Approved"){
            console.log("verdict in readable data is ",readableData[0])
            let ApproveData=readableData;
            ApproveData[3] = "Approved"
            console.log("approved data being",ApproveData)
            return writeToStore(context,address,ApproveData)
            }else if(verdict === "Approved"){
            console.log("verdict in readable data is ",readableData[3])
            let RejectData=readableData;
            RejectData[3] = "Rejected"
            console.log("reject data being",RejectData)
            return writeToStore(context,address,RejectData)
                
            }
            
            })

}



//transaction handler class

class Vehicle extends TransactionHandler{
    constructor(){
        super(FAMILY_NAME, ['1.0'], [NAMESPACE]);
    

    }
//apply function
    apply(transactionProcessRequest, context){
        let PayloadBytes = decoder.decode(transactionProcessRequest.payload)
        console.log("payloadbytes",PayloadBytes)
        let Payload = PayloadBytes.toString().split(',')
        console.log("payload",Payload)
        let action = Payload[0]
        const signerPK = transactionProcessRequest.header.signerPublicKey;
        console.log("signerpk setaki")
        console.log(typeof(Payload[1]))
        if (action === "New Policy"){
            return addpolicy(context,Payload[0],Payload[1],Payload[2],Payload[3])
        }
        else if(action === "Claim"){
            return claimPolicy(context,Payload[0],Payload[1],Payload[2],Payload[3])
        }
        else if(action === "Police Complain"){
            return policecomplaint(context,Payload[0],Payload[1],Payload[2],Payload[3])
            console.log("Inside police complaint",Payload[3]);
        }
        else if(action === "claim Approvel"){
            return claimApprovel(context,Payload[1],Payload[2])
            console.log("Inside")

        }
    }
}

const transactionProcesssor = new TransactionProcessor(URL);
transactionProcesssor.addHandler(new Vehicle);
transactionProcesssor.start();



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



//const FAMILY_NAME = "Vehicle Chain"
//const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);
//const URL = 'tcp://validator:4004';


//Manufacturer private key 
//MANUFACTURERKEY = '8f99bb8b1dc799fd1ed9b7e370330f9378c78f7c332ac3e2233bf559ce21ea8b'

// function to hash data
function hash(data) {
    return crypto.createHash('sha512').update(data).digest('hex');
}

/* function to write data to state 
parameter : 
    context -  validator context object
    address - address to which data should be written to
    data - the data tto be written
*/



const FAMILY_NAME = "Vehicle Chain"
const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);
const URL = 'tcp://validator:4004';







/* function to retrive the address of a particular vehicle based on its vin number 

function getVehicleAddress(signerPK,){
   
let keyHash  = hash(publicKeyHex)
let nameHash = hash("Vehicle Chain")
let vinHash = hash(vinNumber)
return nameHash.slice(0,6) +vinHash.slice(0,6)+keyHash.slice(0,58)

}

////
function getVehicleDataAddress(){
const context = createContext('secp256k1');
let key = Secp256k1PrivateKey.fromHex(MANUFACTURERKEY)
let signer = new CryptoFactory(context).newSigner(key);
let publicKeyHex = signer.getPublicKey().asHex()    
let keyHash  = hash(publicKeyHex)
let nameHash = hash("Vehicle Chain")
let vinHash = hash(vinNumber)
return nameHash.slice(0,6) +vinHash.slice(0,6)+keyHash.slice(0,58)

}




/* function to add manufactured vehicle data to chain
parameter :
context - validator context object
manufacturer - name of manufacturer
vinNumber - vehicle VIN number
dom - date of manufacturing
mode - vehicle model
engine number - engine serial number 
*/      

var policekey = "93f583146581d4d153c257ce8d1a858a017d8683dff9fa08a69441f464622a28";
/* function to add  vehicle registration data to chain
parameter :
context - validator context object
Registrar - Registering authority      
vinNumber - vehicle vinNumber
dor - date of registration
owner - owner of  the car 
platenumber - platenumber of car 


function registerVehicle(context,vinNumber,dor,owner,plateNumber,Register,OwnerAddress){
    console.log("registrering vehicle")
    let address = getVehicleAddress(vinNumber)
    return context.getState([address]).then(function(data){
    console.log("data",data)
    if(data[address] == null || data[address] == "" || data[address] == []){
        console.log("Invalid vin number!")
    }else{
    let stateJSON = decoder.decode(data[address])
    let newData = stateJSON + "," + [dor,owner,plateNumber,Register,OwnerAddress].join(',')
    return writeToStore(context,address,newData)
    }
    })
        

    
}*/


function _getAddressToStore(action,Policynum){
   
    let keyHash  = hash(Policynum)
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




function addpolicy (context,action,name,Email,Linum,Polnum) {
    console.log("addpolicy tp function")
    let address =_getAddressToStore(action,Polnum)
    let Policy_Details =[name,Email,Linum,Polnum]
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




function claimPolicy(context,action,name,Email,LiNum,Polnum){
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
    let claim_data =[name,Email,LiNum,Polnum]
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
    if(data[insurAddress] == null || data[insurAddress] == "" || data[insurAddress] == []){
        console.log("Policy Doesnt Exist!")
    }else{
        let complain_data =[name,LiNum,Policynum]
        return writeToStore(context,complainAddress,complain_data)
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
        if (action === "New Policy"){
            return addpolicy(context,Payload[0],Payload[1],Payload[2],Payload[3],Payload[4])
        }
        else if(action === "Claim"){
            return claimPolicy(context,Payload[0],Payload[1],Payload[2],Payload[3],Payload[4])
        }
        else if(action === "Police Complain"){
            return policecomplaint(context,Payload[0],Payload[1],Payload[2],Payload[3])
        }
    }
}

const transactionProcesssor = new TransactionProcessor(URL);
transactionProcesssor.addHandler(new Vehicle);
transactionProcesssor.start();



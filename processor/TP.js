/* Transaction Processor */
const {TextEncoder,TextDecoder} = require('text-encoding/lib/encoding')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { TransactionProcessor } = require('sawtooth-sdk/processor');
const crypto = require('crypto');
const {
    InvalidTransaction,
    InternalErrorpayloadActions
  } = require('sawtooth-sdk/processor/exceptions')
const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1')
const {createContext,CryptoFactory} = require('sawtooth-sdk/signing');

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

function addVehicle (context,manufacturer,vinNumber,dom,model,engineNumber) {
    let vehicle_Address = getVehicleAddress(vinNumber)
    let vehicle_detail =[manufacturer,vinNumber,dom,model,engineNumber]
    return writeToStore(context,vehicle_Address,vehicle_detail)
}

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


function _getAddressToStore(action,PK,Licensenum){
   
    let keyHash  = hash(PK)
    let nameHash = hash("Vehicle Chain")
    let vinHash = hash(Licensenum)
    if(action === "New Policy"){
        return nameHash.slice(0,6) +'00' +keyHash.slice(0,56) +vinHash.slice(0,6)
    } 
    else if(action === "Claim"){
        return nameHash.slice(0,6) +'01' +keyHash.slice(0,56) +vinHash.slice(0,6)
    }
    
    }








    function writeToStore(context, address, data){
        dataBytes = encoder.encode(data)
        let entries = {
        [address]: dataBytes
      }
    return context.setState(entries);
    
    }




function addpolicy (context,action,name,Email,Linum,signerPK) {
    console.log("addpolicy tp function")
    let address =_getAddressToStore(action,signerPK,Linum)
    let Policy_Details =[name,Email,Linum]
    return context.getState([address]).then(function(data){
        console.log("data",data)
        if(data[address] == null || data[address] == "" || data[address] == []){
            return writeToStore(context,address,Policy_Details)
        }
        else{
            throw new InvalidTransaction("Project already exists");
        }
    })
}




function claimPolicy(context,action,name,Email,LiNum,Claimdet,PK){
    console.log("claimimg policy")
    let address = _getAddressToStore("New Policy",PK,Linum)
    let claimAddress =_getAddressToStore(action,PK,Linum)
    return context.getState([address]).then(function(data){
    console.log("data",data)
    if(data[address] == null || data[address] == "" || data[address] == []){
        console.log("Policy Doesnt Exist!")
    }else{
    let claim_data =[name,Email,LiNum,Claimdet]
    return writeToStore(context,claimAddress,claim_data)
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
            return addpolicy(context,Payload[0],Payload[1],Payload[2],Payload[3],signerPK)
        }
        else if(action === "Claim"){
            return claimPolicy(context,Payload[0],Payload[1],Payload[2],Payload[3],Payload[4],signerPK)
        }
        
    }
}

const transactionProcesssor = new TransactionProcessor(URL);
transactionProcesssor.addHandler(new Vehicle);
transactionProcesssor.start();



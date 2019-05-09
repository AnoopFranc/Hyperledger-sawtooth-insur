const crypto = require("crypto");
const { TextEncoder } = require("text-encoding/lib/encoding");
const { Secp256k1PrivateKey } = require("sawtooth-sdk/signing/secp256k1");
const { createContext, CryptoFactory } = require("sawtooth-sdk/signing");
const protobuf = require("sawtooth-sdk/protobuf");
const http = require("http");
const fetch = require("node-fetch");

var encoder = new TextEncoder("utf8");

function hash(data) {
  return crypto
    .createHash("sha512")
    .update(data)
    .digest("hex");
}

FAMILY_NAME = "Vehicle Chain";
Police_Key = "5a4c22ddec700916fc8e7deaebd72ecb7be6437c824b39f400b07a7e71800e62";

/* function to create Transaction 
parameter : 
familyName -  the transaction family name 
inputlist - list of input addressess
outputlist - list of output addressess
privkey - the user private key
payload - payload
familyVersion - the version of the family
*/

//Approved keys for manufacturer and registrar
//MANUFACTURERKEY = '8f99bb8b1dc799fd1ed9b7e370330f9378c78f7c332ac3e2233bf559ce21ea8b'
//REGISTERKEY = '4206848f09f0953370fc3e4a131faeab07e239d451190294e5049cfcf05a107e'

//family name

// class for vehicle
class Vehicle {
  constructor(Key) {
    if (Key) {
      const context = createContext("secp256k1");
      const secp256k1pk = Secp256k1PrivateKey.fromHex(Key.trim());
      this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
      this.publicKey = this.signer.getPublicKey().asHex();
      this.address = this.get_address(this.publicKey);
      console.log("Storing at: " + this.address);
    }
  }

  get_address(publicKey) {
    var Address =
      hash(FAMILY_NAME).substr(0, 6) + "00" + hash(publicKey).substr(0, 62);
    return Address;
  }

  async send_data(payload) {
    //var payload = ''
    var address = hash(FAMILY_NAME).substr(0, 6);
    console.log("output " + address);

    var inputAddressList = [address];
    var outputAddressList = [address];
    //payload = action + "&,"+ values + "&," + pData;
    var encode = new TextEncoder("utf8");
    const payloadBytes = encode.encode(payload);
    var pub = this.signer.getPublicKey().asHex();
    console.log("Public Key:",pub);
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
      familyName: FAMILY_NAME,
      familyVersion: "1.0",
      inputs: inputAddressList,
      outputs: outputAddressList,
      signerPublicKey: this.signer.getPublicKey().asHex(),
      nonce: "" + Math.random(),
      batcherPublicKey: this.signer.getPublicKey().asHex(),
      dependencies: [],
      payloadSha512: hash(payloadBytes)
    }).finish();

    const transaction = protobuf.Transaction.create({
      header: transactionHeaderBytes,
      headerSignature: this.signer.sign(transactionHeaderBytes),
      payload: payloadBytes
    });
    const transactions = [transaction];
    const batchHeaderBytes = protobuf.BatchHeader.encode({
      signerPublicKey: this.signer.getPublicKey().asHex(),
      transactionIds: transactions.map(txn => txn.headerSignature)
    }).finish();

    const batchSignature = this.signer.sign(batchHeaderBytes);
    const batch = protobuf.Batch.create({
      header: batchHeaderBytes,
      headerSignature: batchSignature,
      transactions: transactions
    });

    const batchListBytes = protobuf.BatchList.encode({
      batches: [batch]
    }).finish();
    this._send_to_rest_api(batchListBytes);
  }

  async _send_to_rest_api(batchListBytes) {
    if (batchListBytes == null) {
      try {
        var geturl = "http://rest-api:8008/state/" + this.address;
        console.log("Getting from: " + geturl);
        let response = await fetch(geturl, {
          method: "GET"
        });
        let responseJson = await response.json();
        console.log("responseJSON", responseJson);
        var data = responseJson.data;
        console.log("data", data);
        var amount = Buffer.from(data, "base64").toString();
        return amount;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("new code");
      try {
        resp = await fetch("http://rest-api:8008/batches", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: batchListBytes
        });
        console.log("response", resp);
      } catch (error) {
        console.log("error in fetch", error);
      }
    }
  }

  async addPolicy(action, name, Email, Linum,polnum) {
    console.log("entering policyadd");

    //let address = get_address(pkey)
    let payload = [action, name, Email, Linum,polnum].join(",");
    this.send_data(payload);
    console.log("Data logged to newpolicy");
  }

  async addClaim(action, name, Email, LiNum,Polnum) {
    //let address = get_address(pkey)
    let payload = [action, name, Email, LiNum,Polnum].join(",");
    this.send_data(payload);
  }

  async addComplain(action, name, LiNum, pubkey) {
    //let address = get_address(pkey)
    let payload = [action, name, LiNum, pubkey].join(",");
    this.send_data(payload);
  }

  async authenticate(key) {
    if (key === Police_Key) {
    }
  }

  //////

  /**
   * Get state from the REST API
   * @param {*} address The state address to get
   * @param {*} isQuery Is this an address space query or full address
   */
  async getState(address, isQuery) {
    let stateRequest = "http://rest-api:8008/state";
    if (address) {
      if (isQuery) {
        stateRequest += "?address=";
      } else {
        stateRequest += "/address/";
      }
      stateRequest += address;
    }
    let stateResponse = await fetch(stateRequest);
    let stateJSON = await stateResponse.json();
    return stateJSON;
  }

  async getVehicleListings(linum) {
    //keyhash = hash(this.signer.getPublicKey().asHex());
    //let licensehash = hash(linum);
    let vehicleListingAddress =
      hash(FAMILY_NAME).substr(0, 6) +
      "02";
    return this.getState(vehicleListingAddress, true);
  }
  async getPolicyListings(Pnum) {
    let PnumHash = hash(Pnum);
    let PolicyClaimAddres = hash(FAMILY_NAME).substr(0, 6) +
    "02"+PnumHash.substr(0,62);

  return this.getState(PolicyClaimAddres, false);
}
  //////
}

module.exports.Vehicle = Vehicle;

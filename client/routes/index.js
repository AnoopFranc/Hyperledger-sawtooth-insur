var express = require("express");
var { Vehicle } = require("./UserClient");
var router = express.Router();
var sessionStorage = require("node-sessionstorage");

router.get("/", function(req, res, next) {
  res.render("login", { title: "Login" });
});

router.get("/dashboard", function(req, res, next) {
  res.render("dashboards", { title: "Dashboards" });
});

router.get("/newpolicy", function(req, res, next) {
  res.render("newpolicy", { title: "New Policy" });
});

router.get("/fileclaim", function(req, res, next) {
  res.render("fileclaim", { title: "File Claim" });
});

router.get("/policecomplaint", function(req, res, next) {
  res.render("policecomplaint", { title: "Police Complaint" });
});

router.get("/policelogin", function(req, res, next) {
  res.render("policelogin", { title: "Police Login" });
});

router.get("/policylist", async (req, res) => {
  let pk = sessionStorage.getItem("user");

   console.log("Private Key",pk);
   var vehicleClient = new Vehicle(pk);
   let policy = sessionStorage.getItem("Policy");
   console.log("policy is",policy)
   let stateData = await vehicleClient.getPolicyListings(policy);
   console.log("StateData:",stateData);
   //console.log("listings", stateData);
   let vehiclesList = [];
   stateData.data.forEach(vehicles => {
     if (!vehicles.data) return;
     let decodedVehicles = Buffer.from(vehicles.data, "base64").toString();
     let vehicleDetails = decodedVehicles.split(',');
   
     console.log("decodedVehicles------", decodedVehicles);
     console.log("vechicle list", vehicleDetails[0],vehicleDetails[1],vehicleDetails[2]);
     
     vehiclesList.push({
      name: vehicleDetails[0],
       License: vehicleDetails[1],
       policyNumber: vehicleDetails[2],
       status: vehicleDetails[3]
     });
   });
   res.render('complainList', { listings: vehiclesList });
 });

router.get("/listComplaints", async (req, res) => {
  let pk = sessionStorage.getItem("police");
  console.log("Private Key",pk);
  var vehicleClient = new Vehicle(pk);
  let stateData = await vehicleClient.getVehicleListings();
  console.log("StateData:",stateData);
  //console.log("listings", stateData);
  let vehiclesList = [];
  stateData.data.forEach(vehicles => {
    if (!vehicles.data) return;
    let decodedVehicles = Buffer.from(vehicles.data, "base64").toString();
    let vehicleDetails = decodedVehicles.split(',');
  
    console.log("decodedVehicles------", decodedVehicles);
    console.log("vechicle list", vehicleDetails[0],vehicleDetails[1],vehicleDetails[2]);
    
    vehiclesList.push({
      vinNum: vehicleDetails[0],
      engineNo: vehicleDetails[1],
      model: vehicleDetails[2],
      Approved : "Approved",
      Rejected:"Rejected"
    });
  });
  res.render('vehicleList', { listings: vehiclesList });
});


router.post('/',(req,res)=>{
  console.log("hello")
  var Key = req.body.pk;
  sessionStorage.setItem("user",Key);
  var client = new Vehicle(Key);
  res.send({ done:1, privatekey: Key, message: "you have succesfully logged in using "+ Key });
});

router.post("/newpolicy", function(req, res) {
  console.log("entered");
  let name = req.body.name;
  //let Email = req.body.email;
  let Linum = req.body.lp;
  let polnum = req.body.polnum
  sessionStorage.setItem("Policy",polnum);
  // let Pnum = req.body.Pnum
  let p_key = req.body.pkey;
  console.log("name", name);
  console.log("lp", Linum);
  console.log("policynum",polnum)
  // let Claimdet = req.body.Claimdet
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addPolicy("New Policy", name, Linum,polnum);
  res.send({ done:1, policynumber:polnum, message: "Data successfully added" });
  res.send({ message: "Data successfully added" });
});

router.post("/fileclaim", function(req, res) {
  let name = req.body.name;
  let LiNum = req.body.LiNum;
  let p_key = req.body.privkey;
  let Polnum = req.body.Polnum
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addClaim("Claim", name, LiNum,Polnum);
  res.send({ done:1});
  res.send({ message: "Data successfully added" });
});

router.post("/complaint", function(req, res) {
  let name = req.body.name;
  let LiNum = req.body.LiNum;
  let p_key = req.body.pkey;
  let polno = req.body.PubKey;
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addComplain("Police Complain", name, LiNum, polno);
  res.send({ done:1});
  res.send({ message: "Data successfully added" });
});

router.post("/policelogin", function(req, res) {
  let pKey = req.body.prik;
  console.log(pKey);
  var policekey = "93f583146581d4d153c257ce8d1a858a017d8683dff9fa08a69441f464622a28";
  sessionStorage.setItem("police",policekey);
  if (policekey === pKey){
    res.send({done:1, privatekey: pKey, message: "you have succesfully logged in"})
  } 
else{
  res.send({done:0, message: "you have entered the wrong key"});
}
  
});


router.post("/claimapprovel", function(req, res) {
  console.log("enter index")
  let verdict = req.body.Vedict;
  let policynum = req.body.Polnum;
  let p_key = sessionStorage.getItem("police");
  console.log("police private key",p_key);
  console.log("Data sent to REST API FOR APPROVEL/REJECTION");
  var client = new Vehicle(p_key);
  client.claimApprovel("claim Approvel", verdict, policynum);
  res.send({ message: "settled" });
});

module.exports = router;

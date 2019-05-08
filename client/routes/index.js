var express = require("express");
var { Vehicle } = require("./UserClient");
var router = express.Router();
var sessionStorage = require("node-sessionstorage");

/* GET home page. */
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

router.get("/listComplaints", async (req, res) => {
 let pk = sessionStorage.getItem("privatekey");
  console.log("Private Key",pk);
  var vehicleClient = new Vehicle(pk);
  let stateData = await vehicleClient.getVehicleListings(pk);
  console.log("StateData:",stateData);
  //console.log("listings", stateData);
  /* try{ */
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
      model: vehicleDetails[2]
      /* dom: vehicleDetails[2],
      status: vehicleDetails.length === 5 ? "Not Registered" : "Registered",
      owner: vehicleDetails[6],
      address: vehicleDetails[9],
      dor: vehicleDetails[5],
      numberPlate: vehicleDetails[7] */
    });
  });
/* } catch (error) {
  console.error(error);
} */
  res.render('vehicleList', { listings: vehiclesList });
});



//////


router.post('/',(req,res)=>{
  console.log("hello")
  var Key = req.body.pk;
  var client = new Vehicle(Key);
  res.send({ done:1, privatekey: Key, message: "you have succesfully logged in using "+ Key });
});

router.post("/newpolicy", function(req, res) {
  console.log("entered");
  let name = req.body.name;
  let Email = req.body.email;
  let Linum = req.body.lp;
  let polnum = req.body.polnum
  // let Pnum = req.body.Pnum
  let p_key = req.body.pkey;
  console.log("name", name);
  console.log("lp", Linum);
  console.log("policynum",polnum)
  // let Claimdet = req.body.Claimdet
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addPolicy("New Policy", name, Email, Linum,polnum);
  res.send({ done:1, policynumber:polnum, message: "Data successfully added" });
  res.send({ message: "Data successfully added" });
});

router.post("/fileclaim", function(req, res) {
  let name = req.body.name;
  let Email = req.body.email;
  let LiNum = req.body.LiNum;
  let p_key = req.body.privkey;
  let Claimdet = req.body.Claimdet;
  let Polnum = req.body.Polnum
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addClaim("Claim", name, Email, LiNum, Claimdet,Polnum);
  res.send({ message: "Data successfully added" });
});

router.post("/complaint", function(req, res) {
  let name = req.body.name;
  let LiNum = req.body.LiNum;
  let p_key = req.body.pkey;
  let polno = req.body.PubKey;
  //let Claimdet = req.body.Claimdet;
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addComplain("Police Complain", name, LiNum, polno);
  res.send({ message: "Data successfully added" });
});

router.post("/policelogin", function(req, res) {
  let pKey = req.body.prik;
  console.log(pKey);
  var policekey = "93f583146581d4d153c257ce8d1a858a017d8683dff9fa08a69441f464622a28";
  sessionStorage.setItem("privatekey",policekey);
  if (policekey === pKey){
    res.send({done:1, privatekey: pKey, message: "you have succesfully logged in"})
  } 
else{
  res.send({done:0, message: "you have entered the wrong key"});
}
  
});

router.post("/addVehicle", function(req, res) {
  let key = req.body.key;
  let vin = req.body.vin;
  let model = req.body.model;
  let dom = req.body.date;
  let engineNo = req.body.engine;
  console.log("Data sent to REST API");
  var client = new Vehicle();
  client.addVehicle("Manufacturer", key, vin, dom, model, engineNo);
  res.send({ message: "Data successfully added" });
});
router.post("/registerVehicle", function(req, res) {
  let key = req.body.key;
  let vin = req.body.vin;
  let OwnName = req.body.OwnerName;
  let dor = req.body.Dor;
  let plateNo = req.body.plate;
  let address = req.body.addr;
  console.log("Data sent to REST API");
  var client = new Vehicle();
  client.registerVehicle("Registrar", key, vin, dor, OwnName, plateNo, address);
  res.send({ message: "Data successfully added" });
});
module.exports = router;

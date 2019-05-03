var express = require('express');
var{ Vehicle }= require('./UserClient')
var router = express.Router();
var sessionStorage = require('node-sessionstorage')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboards', { title: 'Dashboards' });
});

router.get('/newpolicy', function(req, res, next) {
  res.render('newpolicy', { title: 'New Policy' });
});

router.get('/fileclaim', function(req, res, next) {
  res.render('fileclaim', { title: 'File Claim' });
});

router.get('/policecomplaint', function(req, res, next) {
  res.render('policecomplaint', { title: 'Police Complaint' });
});

router.get('/policelogin', function(req, res, next) {
  res.render('policelogin', { title: 'Police Login' });
});

////
router.get('/listVehicles', async (req,res)=>{
  let lpn = sessionStorage.getItem('Linum')
  console.log(lpn)
  var vehicleClient = new Vehicle();
  let stateData = await vehicleClient.getVehicleListings(lpn);
  //console.log("listings", stateData);
  let vehiclesList = [];
  stateData.data.forEach(vehicles => {
    if(!vehicles.data) return;
    let decodedVehicles = Buffer.from(vehicles.data, 'base64').toString();
    let vehicleDetails = decodedVehicles.split(',');

    //console.log("decodedVehicles------", decodedVehicles);
    vehiclesList.push({
      vinNum: vehicleDetails[1],
      engineNo: vehicleDetails[4],
      model: vehicleDetails[3],
      dom: vehicleDetails[2],
      status: (vehicleDetails.length === 5)?"Not Registered":"Registered",
      owner: vehicleDetails[6],
      address: vehicleDetails[9],
      dor: vehicleDetails[5],
      numberPlate: vehicleDetails[7]
    });
  });

  res.render('vehicleList', { listings: vehiclesList });
});


router.get('/homePage',(req,res)=>{
  res.render('dashboards', { title: 'Dashboards' });
});

//////

    
router.post('/newpolicy',function(req, res){
  console.log("entered");
  let name = req.body.name
  let Email = req.body.email
  let Linum = req.body.lp
  sessionStorage.setItem('Linum',Linum)
  // let Pnum = req.body.Pnum
  let p_key = req.body.pkey;
  console.log("name",name);
  console.log("lp",Linum);
  // let Claimdet = req.body.Claimdet
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addPolicy("New Policy",name,Email,Linum)
  res.send({ done:1, privatekey: p_key, message: "Data successfully added"});
})






router.post('/fileclaim',function(req, res){
  let name = req.body.name
  let Email = req.body.email
  let LiNum = req.body.LiNum
  let p_key = req.body.pkey;
  let Claimdet = req.body.Claimdet
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addClaim("Claim",name,Email,LiNum,p_key,Claimdet)
  res.send({message: "Data successfully added"});
})

router.post('/complaint',function(req, res){
  let name = req.body.name
  let LiNum = req.body.LiNum
  let p_key = req.body.pkey;
  let pubK = req.body.PubKey;
  let Claimdet = req.body.Claimdet
  console.log("Data sent to REST API");
  var client = new Vehicle(p_key);
  client.addComplain("Police Complain",name,LiNum,p_key,pubK,Claimdet)
  res.send({message: "Data successfully added"});
})

router.post('/policelogin',function(req,res){
  let pKey = req.body.prik;
  console.log(pKey);
  var client = new Vehicle(pKey);

  res.send()

})



router.post('/addVehicle',function(req, res){
  let key = req.body.key
  let vin = req.body.vin
  let model = req.body.model
  let dom = req.body.date
  let engineNo = req.body.engine
  console.log("Data sent to REST API");
  var client = new Vehicle();
  client.addVehicle("Manufacturer",key,vin,dom,model,engineNo)
  res.send({message: "Data successfully added"});
})
router.post('/registerVehicle',function(req, res){
  let key = req.body.key
  let vin = req.body.vin
  let OwnName = req.body.OwnerName
  let dor = req.body.Dor
  let plateNo = req.body.plate
  let address = req.body.addr
  console.log("Data sent to REST API");
  var client = new Vehicle();
  client.registerVehicle("Registrar",key,vin,dor,OwnName,plateNo,address)
  res.send({message: "Data successfully added"});
})
module.exports = router;

var express = require('express');
var router = express.Router();
var {CookiejarClient}  = require('./CookiejarClient');
var fs = require('fs');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'KBA' });
});

router.get('/bake',(req,res)=>{
  res.render('Bake');
});

router.get('/eat',(req,res)=>{
  res.render('Eat');
});

router.get('/count',(req,res)=>{
  res.render('Count');
});

router.get('/home',(req,res)=>{
  res.render('Home', { title: 'Sawtooth'});
});

router.get('/exchange', async (req, res) => {
  const key = "";
  let cookiejar_client = new CookiejarClient(key);
  let stateData = await cookiejar_client.getOrderListings();
  console.log("listings", stateData);
  let exchangeOrdersList = [];
  stateData.data.forEach(order => {
    if(!order.data) return;
    let decodedOrder = JSON.parse(Buffer.from(order.data, 'base64').toString('ascii'));
    exchangeOrdersList.push({
      address : order.address,
      data: decodedOrder
    });
  });
  res.render('Exchange', { listings: exchangeOrdersList });
})

router.post('/',(req,res)=>{
  console.log("hello")
  var Key = req.body.privateKey;
  // var cookiejar_client = new CookiejarClient(Key);
  res.send({ done:1, privatekey: Key, message: "your privatekey is "+ Key });
});

router.post('/bake',(req,res,next)=>{
  var count= req.body.cookie;
  var pri_key= req.body.pri_key;
  var  cookiejar_client = new CookiejarClient(pri_key);
  cookiejar_client.send_data('bake',[count]);
  res.send({message: "Bake " +count+ "Cookies"});

});

router.post('/eat',(req,res,next)=>{
  var count= req.body.cookie;
  var pri_key=req.body.pri_key;
  var cookiejar_client = new CookiejarClient(pri_key);
  cookiejar_client.send_data('eat',[count]);
  res.send({message: "Eat " +count+ "Cookies"});
});

router.post('/count', (req, res)=>{
  var pri_key=req.body.pri_key;
  const cookiejar_client = new CookiejarClient(pri_key);
  const getYourBalance =  cookiejar_client._send_to_rest_api(null);
  getYourBalance.then(result => {res.send({ balance: result});});
})

router.post('/order',(req,res,next)=>{
  let count = req.body.cookie;
  let pri_key = req.body.pri_key;
  let pData = req.body.data;
  var cookiejar_client = new CookiejarClient(pri_key);
  cookiejar_client.send_data('order',[count],pData);
  res.send({message: "Order placed: " +count+ "Cookies"});
});

router.post('/acceptOrder',(req,res,next)=>{
  let count = req.body.cookie;
  let pri_key = req.body.pri_key;
  let pData = req.body.data;
  var cookiejar_client = new CookiejarClient(pri_key);
  cookiejar_client.send_data('accept',[count],pData);
  res.send({message: "Accept Order"});
});

router.post('/exchange', async (req, res) => {
  const key = "";
  let cookiejar_client = new CookiejarClient(key);
  let stateData = await cookiejar_client.getOrderListings();
  console.log("listings", stateData);
  let exchangeOrdersList = [];
  stateData.data.forEach(order => {
    if(!order.data) return;
    let decodedOrder = JSON.parse(Buffer.from(order.data, 'base64').toString('ascii'));
    console.log("decodedOrder", decodedOrder);
    exchangeOrdersList.push({
      address : order.address,
      data: decodedOrder
    });
  });
  console.log("Exchange order list", exchangeOrdersList);
  res.send({ listings: exchangeOrdersList });
})

module.exports = router;

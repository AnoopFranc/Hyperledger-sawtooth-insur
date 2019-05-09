function login_insur() {
  const Key = document.getElementById("privkey").value;
  if (Key.length === 0) {
    console.log(Key);
    alert("please enter the Key");
  } else {
    $.post(
      "/",
      { pk: Key },
      (data, textStatus, jqXHR) => {
        if ((data.done == 1)) {
          sessionStorage.clear();
          sessionStorage.setItem("privatekey", data.privatekey);
          alert(data.message);
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/";
        }
      },
      "json"
    );
  }
}

/* function Logout(){
    sessionStorage.clear();
    window.location.href='/';
} */

function newPolicy(event) {
  event.preventDefault();
  let name = document.getElementById("first_name").value;
  let licensePlate = document.getElementById("License").value;
  console.log("licen", licensePlate);
  console.log("nam", name);
  //let email = document.getElementById("email").value;
  let pkey = sessionStorage.getItem("privatekey");
  var policy = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  var Polnum = policy.toString();
  sessionStorage.setItem("Polnum",Polnum)
  $.post(
    "/newpolicy",
    { name: name, lp: licensePlate, pkey: pkey,polnum:Polnum}, (data, textStatus, jqXHR) => {
      if ((data.done == 1)) {
        alert(data.message);
        alert(data.policynumber);
        window.location.href = "/dashboard";
      }
    "json"
    });
}




function fileClaim(event) {
  event.preventDefault();
  let name = document.getElementById("first_name").value;
  //let Email = document.getElementById("email").value;
  let Lnum = document.getElementById("License").value;
  let pkey = sessionStorage.getItem("privatekey");
  let polnum = sessionStorage.getItem("Polnum");
  // let PolicyNumber = document.getElementById('policy_number').value;
  //let ClaimDetails = document.getElementById("accident_details").value;
  $.post(
    "/fileclaim",
    {
      name: name,
      LiNum: Lnum,
      privkey: pkey,
      Polnum : polnum
    },
    "json"
  );
}

function policeLog() {
  let privKey = document.getElementById("password").value;
  $.post(
    "/policelogin",
    { prik: privKey },
    (data, textStatus, jqXHR) => {
      if ((data.done == 1)) {
        sessionStorage.clear();
        sessionStorage.setItem("privatekey", data.privatekey);
        window.location.href = "/listComplaints"
      } else if(data.done == 0) {
        window.location.href = "/policelogin";
      }
    },
    "json"
  );
}

function complaint(event) {
  event.preventDefault();
  let name = document.getElementById("name").value;
  let Lnum = document.getElementById("License").value;
  let pkey = sessionStorage.getItem("privatekey");
  let PolicyNumber = document.getElementById("policy_number").value;
  //let ClaimDetails = document.getElementById("accident_details").value;
  $.post(
    "/complaint",
    {
      name: name,
      LiNum: Lnum,
      pkey: pkey,
      PubKey: PolicyNumber,
     // Claimdet: ClaimDetails
    },
    "json"
  );
}


function VerdictOnClaim(event,verdict,polnum){
  event.preventDefault();
  if(verdict === "Approved"){
    document.getElementById("reject").disabled = true;
  }else{
    document.getElementById("approve").disabled = true;
  }    $.post(
    "/claimapprovel",
    {
      Vedict:verdict,
      Polnum:polnum
    },
    "json"
  );
}


function viewData() {
  window.location.href = "/listView";
}


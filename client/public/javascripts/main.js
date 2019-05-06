function login_insur(){
    const Key = document.getElementById('privkey').value;
    if(Key.length === 0){
        console.log(Key);
        alert("please enter the Key");
    }
    else{
        $.post('/',{ pk : Key},(data, textStatus, jqXHR)=>{
            if(data.done =1){
                sessionStorage.clear();
                sessionStorage.setItem("privatekey",data.privatekey);
                alert(data.message);
                window.location.href='/dashboard';
            }
            else{
                window.location.href='/';
            }
            
        },'json');
    }
}

function Logout(){
    sessionStorage.clear();
    window.location.href='/';
}



function newPolicy(event){
    event.preventDefault();
    let name = document.getElementById('first_name').value;
    let licensePlate = document.getElementById('License').value;
    console.log("licen",licensePlate);
    console.log("nam",name);
    let email = document.getElementById('email').value;
    let pkey= sessionStorage.getItem("privatekey");
    $.post('/newpolicy',{ name:name, lp:licensePlate, email:email, pkey:pkey} , 'json');
}

function fileClaim(event) {
        event.preventDefault();
        let name    = document.getElementById('first_name').value;
        let Email   = document.getElementById('email').value;
        let Lnum    = document.getElementById('License').value;
        let pkey    = sessionStorage.getItem("privatekey");
        // let PolicyNumber = document.getElementById('policy_number').value;
        let ClaimDetails = document.getElementById('accident_details').value;
        $.post('/fileclaim',{ name:name,email:Email,LiNum:Lnum,privkey:pkey,Claimdet:ClaimDetails } ,'json');
        
    }


function policeLog(event){
    event.preventDefault();
    let privKey    = document.getElementById('password').value;
    $.post('/policelogin', { prik:privKey} ,(data, textStatus, jqXHR)=>{ 
        if(data.done =1){
            sessionStorage.clear();
            sessionStorage.setItem("privatekey",data.privatekey);
        }
            else{
                window.location.href='/';
            }
            
        },'json');
}


function complaint(event) {
    event.preventDefault();
    let name    = document.getElementById('name').value;
    let Lnum    = document.getElementById('License').value;
    let pkey    = sessionStorage.getItem("privateK");
    let PolicyNumber = document.getElementById('policy_number').value;
    let ClaimDetails = document.getElementById('accident_details').value;
    $.post('/complaint',{ name:name,LiNum:Lnum,pkey:pkey,PubKey:PolicyNumber,Claimdet:ClaimDetails } ,'json');
    
}


function viewData() {
    window.location.href='/listView';

}



////
/*
function listVehicles(event){
    event.preventDefault();
    console.log("listVehicles(event)-----");
    window.location.href='/vehicleList';
}
*/

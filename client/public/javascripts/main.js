function newPolicy(event){
    event.preventDefault();
    let name = document.getElementById('first_name').value;
    let licensePlate = document.getElementById('License').value;
    console.log("licen",licensePlate);
    console.log("nam",name);
    let email = document.getElementById('email').value;
    let pkey=document.getElementById('pkey').value;
    $.post('/newpolicy',{ name:name, lp:licensePlate, email:email, pkey:pkey}, (data, textStatus, jqXHR)=>{ 
    if(data.done =1){
        sessionStorage.clear();
        sessionStorage.setItem("privatekey",data.privatekey);
    }
        else{
            window.location.href='/';
        }
        
    },'json');
}

function fileClaim(event) {
        event.preventDefault();
        let name    = document.getElementById('first_name').value;
        let Email   = document.getElementById('email').value;
        let Lnum    = document.getElementById('License').value;
        let pkey    = sessionStorage.getItem("privatekey");
        // let PolicyNumber = document.getElementById('policy_number').value;
        let ClaimDetails = document.getElementById('accident_details').value;
        $.post('/fileclaim',{ name:name,email:Email,LiNum:Lnum,pkey:pkey,Claimdet:ClaimDetails } ,'json');
        
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

$(document).ready(function(){
    let foldState=false;
    let jsonStr ='';
    function addLoader(){
        $('body').append('<div style="" id="loadingDiv"><div class="loader">Loading...</div></div>');
    }
    function removeLoader(){
        $( "#loadingDiv" ).fadeOut(500, function() {
        // fadeOut complete. Remove the loading div
        $( "#loadingDiv" ).remove(); //makes page more lightweight
        });
    }
    $("#jsonFileRequest").click(requestJson);
    $("#formatJson").click({foldState:foldState},jsonProcess);
    function requestJson(){
        CommonUtils.makeHttpRequest('/jsonRequest',"",'POST').then(
        res=>{
            if(res!=null) {
                console.log("Success to load json file!");
                jsonStr = res.toString();
                //$("#displayArea").html(jsonStr);
                console.log("Success to display json string!");
           }else{
                $("#displayArea").html('Failed to load json file');
           }
        })
    }
    function jsonProcess(event){
        //addLoader();
        let foldState=event.data.foldState;
        if(jsonStr.length==0) return;
        console.log("Start to process json file");
        let result=JsonFormat.formatDisplayJson(foldState,jsonStr,"#displayAfterFormat");
        if(result.success) {
            console.log("Success to format");
            $("#totalLayersNumber").html(result.totalLayersNumber.toString());
            console.log("totalLayersNumber is ",result.totalLayersNumber );
            console.log("keyValuePairsNumber is ",result.keyValuePairsNumber );
            JsonFormat.appendEvent(result);
            console.log("Success to add events response");
        }else{
            console.log(result.msg);
        }
        //removeLoader();
    }
});




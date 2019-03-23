$(document).ready(function(){
    let foldState=false;
    let jsonStr ='';
    $("#jsonFileRequest").click(requestJson);
    $("#formatJson").click({foldState:foldState},jsonFormatProcess);
    function requestJson(){
        CommonUtils.makeHttpRequest('/jsonRequest',"",'POST').then(
        res=>{
            if(res!=null) {
                alert("Success to load json file!");
                console.log("Success to load json file!");
                jsonStr = res.toString();
                $("#displayArea").html(jsonStr);
                console.log("Success to display json string!");
           }else{
                $("#displayArea").html('Failed to load json file');
           }
        })
    }
    function jsonFormatProcess(event){
        let foldState=event.data.foldState;
        if(jsonStr.length==0) return;
        console.log("Start to process json file");
        let result=JsonFormat.formatDisplayJson(foldState,jsonStr,"#displayAfterFormat");
        if(result.success) {
            console.log("Success to format");
            $("#totalLayersNumber").html(result.totalLayersNumber.toString());
            console.log("totalLayersNumber is ",result.totalLayersNumber );
            JsonFormat.appendEvent(result);
            console.log("Success to add events response");
        }else{
            console.log(result.msg);
        }
    }
});




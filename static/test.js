$(document).ready(function(){
    let foldState=false;
    let jsonStr ='';
    $("#jsonFileRequest").click(requestJson);
    $("#compactJson").click(compactAndSaveJson);
    $("#formatJson").click(jsonFormatProcess);
    function requestJson(){
        CommonUtils.makeHttpRequest('/jsonRequest',"",'POST').then(
        res=>{
            if(res.success) {
                alert("Success to load json file!");
                jsonStr = res.data.toString();
                $("#displayArea").html(jsonStr);
           }else{
                alert(res.msg);
           }
        })
    };
    function compactAndSaveJson(){
        if(jsonStr.length==0)
            return alert("Fail to load json string!");
        let compact=JsonFormat.compactJsonStr(jsonStr);
        if(compact.success){
            let data=JSON.stringify({data:compact.str});
            CommonUtils.makeHttpRequest('/jsonCover',data,'POST').then(
                res=>alert(res.msg)
            );
        }
    }
    function jsonFormatProcess(){
        if(jsonStr.length==0)
            return alert("Fail to load json string");
        $("#displayAfterFormat").remove();
        $("body").append($('<div id="displayAfterFormat"></div>'));
        let compact=JsonFormat.compactJsonStr(jsonStr);
        if(compact.success){
            let result=JsonFormat.formatDisplayJson(foldState,compact.str,"#displayAfterFormat");
            if(result.success) {
                alert("Success to format json file!");
                $("#totalLayersNumber").html(result.totalLayersNumber.toString());
                JsonFormat.appendEvent(result);
            }else
                alert(result.msg);
        }else
            return alert("Fail to compact json file!");
    }
});




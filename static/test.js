$(document).ready(function(){
    let foldState=false;
    let jsonStr ='';
    let filePath='';
    $("#jsonFileRequest").click(requestJson);
    $("#compactJson").click(compactAndSaveJson);
    $("#formatJson").click(jsonFormatProcess);

    function requestJson(){
        filePath=$("#filePathInput").val();
        CommonUtils.makeHttpRequest('/jsonRequest',{path:filePath},'POST').then(
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
            let data={data:compact.str,path:filePath};
            CommonUtils.makeHttpRequest('/jsonCover',data,'POST').then(
                res=>alert(res.msg)
            );
        }
    }
    function jsonFormatProcess(){
        let arrayExpandedFlag=!($("#arrayExpandedFlag").is(":checked"));
        if(jsonStr.length==0)
            return alert("Fail to load json string");
        $("#displayAfterFormat").remove();
        $("body").append($('<div id="displayAfterFormat"></div>'));
        let compact=JsonFormat.compactJsonStr(jsonStr);
        if(compact.success){
            let result=JsonFormat.formatDisplayJson(arrayExpandedFlag,foldState,compact.str,"#displayAfterFormat");
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




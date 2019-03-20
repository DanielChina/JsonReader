$(document).ready(function(){
    let foldState=false;
   CommonUtils.makeHttpRequest('/jsonRequest',"",'POST').then(
       res=>{
           if(res!=null) {
               let jsonStr = res.toString();
               $("#displayArea").html(jsonStr);
               let totalLayersNumber=JsonFormat.formatDisplayJson(foldState,jsonStr,"#displayAfterFormat");
               $("#totalLayersNumber").html(totalLayersNumber.toString());
               JsonFormat.appendEvent(foldState,totalLayersNumber);
           }else{
               $("#displayArea").html('Failed to load json file');
           }

       }
   );
});


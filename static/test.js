$(document).ready(function(){
   CommonUtils.makeHttpRequest('/jsonRequest',"",'POST').then(
       res=>{
           if(res!=null) {
               let jsonStr = res.toString();
               $("#displayArea").html(jsonStr);
               let jsonAfterFormat=JsonFormat.formatDisplayJson(false,jsonStr)
               $("#totalLayersNumber").html(jsonAfterFormat.totalLayersNumber.toString());
               $("#newDisplayArea").html(jsonAfterFormat.displayStr);
           }else{
               $("#displayArea").html('Failed to load json file');
           }

       }
   );
});
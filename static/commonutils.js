class CommonUtils{
    static makeHttpRequest(url,data,type){
        return $.ajax({
            type:type,
            url:url,
            data:data,
            contentType: 'application/json',
            dataType:'json'});
    }

};
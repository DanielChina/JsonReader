class CommonUtils{
    static makeHttpRequest(url,data,type){
        return $.ajax({
            type:type,
            url:url,
            data:data,
            contentType: 'application/json',
            dataType:'json'});
    }

    static addLoader(){
        $('body').append('<div style="" id="loadingDiv"><div class="loader">Loading...</div></div>');
    }
    static removeLoader(){
        $( "#loadingDiv" ).fadeOut(500, function() {
        // fadeOut complete. Remove the loading div
        $( "#loadingDiv" ).remove(); //makes page more lightweight
        });
    }
};
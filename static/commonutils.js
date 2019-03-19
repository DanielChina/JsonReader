class CommonUtils{
    static add_loading_modal(){
        let div = $(document.createElement('div'));
        div.attr('id', 'loading_modal');
        div.css('width', '100%');
        div.css('height', '100%');
        div.css('z-index', '1000');
        div.css('top', '0px');
        div.css('left', '0px');
        div.css('background-color', '#EFEFEF');
        div.css('opacity', '0.5');
        div.css('filter', 'alpha(opacity=50)');
        div.css('position', 'fixed');
        div.append('<i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);"></i>');
        $(document.body).prepend(div);
    };
    static remove_loading_modal(){
        $('#loading_modal').remove();
    };
    static makeHttpRequest(url,data,type){
        return $.ajax({
            type:type,
            url:url,
            data:data,
            contentType: 'application/json',
            dataType:'json'});
    }

};
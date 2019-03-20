class JsonFormat{
    static getCurlyBrace(foldState,isLeft,layNumber){
        let curlyBrace = '';
        let currentLayerBlank='';
        for(let i=0;i<(layNumber-1);i++)
            currentLayerBlank+= '<tab></tab>';
        if(foldState){
            if(isLeft) {
                curlyBrace = '<p>' + currentLayerBlank + '<Button class="unfold"></Button>{</p>';
            }
            else {
                if(layNumber>1)
                    curlyBrace = '<p>' + currentLayerBlank + '<Button class="unfold"></Button>},</p>';
                else
                    curlyBrace = '<p>' + currentLayerBlank + '<Button class="unfold"></Button>}</p>';
            }
        }else{
            if(isLeft) {
                curlyBrace = '<p>' + currentLayerBlank + '<Button class="fold"></Button>{</p>';
            }
            else {
                if(layNumber>1)
                    curlyBrace = '<p>' + currentLayerBlank + '<Button class="fold"></Button>},</p>';
                else
                    curlyBrace = '<p>' + currentLayerBlank + '<Button class="fold"></Button>}</p>';
            }
        }
        return curlyBrace;
    }
    static formatDisplayJson(foldState,jsonString,displayId){
        let layerNumberList=[];
        let currentLayerNumber=0;
        let strArray=jsonString.split('');
        let elementId='';
        let currentKeyValueElement=null;
        let keyIndex=0;
        let valueIndex=0;
        let newElement=null;
        for(let index=0;index<strArray.length;index++){
            let char=strArray[index];
            switch(char){
                case '{':
                    currentLayerNumber+=1;
                    elementId='leftCurlyBraceIn'+currentLayerNumber.toString();
                    layerNumberList.push(currentLayerNumber);
                    newElement=$(JsonFormat.getCurlyBrace(foldState,true,currentLayerNumber)).attr("id",elementId);
                    $(displayId).append(newElement);
                    break;
                case '}':
                    elementId='rightCurlyBraceIn'+currentLayerNumber.toString();
                    newElement=$(JsonFormat.getCurlyBrace(foldState,false,currentLayerNumber)).attr("id",elementId);
                    $(displayId).append(newElement);
                    if(currentLayerNumber>=1)
                        currentLayerNumber-=1;
                    break;
                case '\"':
                    let keyResult=JsonFormat.getKey(index, strArray);
                    if(keyResult.end) {
                        elementId='keyAndValue'+keyIndex.toString()+'In'+currentLayerNumber.toString();
                        currentKeyValueElement=$('<p></p>').attr('id',elementId);
                        elementId='key'+keyIndex.toString()+'In'+currentLayerNumber.toString();
                        currentKeyValueElement.append($(JsonFormat.displayKey(keyResult.key,currentLayerNumber)).attr('id',elementId));
                        $(displayId).append(currentKeyValueElement);
                        keyIndex+=1;
                        index +=keyResult.key.length+1;
                    }else
                        return {success:false,msg:"Failed to get key!"};
                    break;
                case ':' :
                    let valueResult=JsonFormat.getValue(':',index,strArray);
                    if(valueResult.end) {
                        elementId='value'+valueIndex.toString()+'In'+currentLayerNumber.toString();
                        if(valueResult.endChar!=',') {
                            index += valueResult.value.length;
                            currentKeyValueElement.append($('<span>'+':'+valueResult.value+'</span>').attr('id',elementId));
                        }else{
                            index += valueResult.value.length+1;
                            currentKeyValueElement.append($('<span>'+':'+valueResult.value+',</span>').attr('id',elementId));
                        }
                        valueIndex+=1;
                    }
                    else
                        return {success:false, msg:"Failed to get value!"};
                    break;
            }
        }
        let totalLayersNumber=Math.max(...layerNumberList);
        return totalLayersNumber;
    };
    static getKey(index,strArray){
        let key="";
        let endFlag=false;
        for(let i=(index+1);i<strArray.length;i++){
            if(strArray[i] != '\"')
                key+=strArray[i];
            else {
                endFlag = true;
                break;
            }
        }
        if(endFlag)
            return { end:true, key:key};
        else
            return { end:false };
    };
    static getValue(startChar,startIndex,strArray){
        let valueStr="";
        let arrayFlag=false;
        for(let i=startIndex+1;i<strArray.length;i++){
            if(strArray[i]=='[')
                arrayFlag=true;
            else if((strArray[i]==']'))
                arrayFlag=false;
            if(!arrayFlag && (strArray[i]=='{' || strArray[i]=='}' || strArray[i]==','))
                return { end:true, value: valueStr, endChar:strArray[i] };
            valueStr+=strArray[i];
        }
        return {lineBreak: false};
    }
    static displayKey(key,layerNumber){
        let currentLayerBlank='';
        for(let i=0;i<layerNumber;i++)
            currentLayerBlank+= '<tab></tab>';
        return '<span>'+currentLayerBlank+'\"'+key+'\"'+'</span>';
    }
    static foldStateShift(event){
        let element=null;
        if(event.data.foldState) {
            element = $(event.data.curlyBraceId).find("Button");
            element.removeClass('unfold');
            element.addClass('fold');
        }
        else
            element = $(event.data.curlyBraceId).find("Button");
            element.removeClass('fold');
            element.addClass('unfold');
    }

    /* Element id map :
       { : leftCurlyBraceIn{layerNumber}
       } : rightCurlyBraceIn{layerNumber}
       key: key[0:]In{layerNumber}
       value: value[0:]In{layerNumber}            */
    static appendEvent(foldState,totalLayersNumber){
        for(let i=0;i<totalLayersNumber; i++){
            let curlyBraceId="#leftCurlyBraceIn"+(i+1).toString();
            $(curlyBraceId).click({foldState:foldState,curlyBraceId:curlyBraceId},JsonFormat.foldStateShift);
            curlyBraceId="#rightCurlyBraceIn"+(i+1).toString();
            $(curlyBraceId).click({foldState:foldState,curlyBraceId:curlyBraceId},JsonFormat.foldStateShift);
        }
    }
}
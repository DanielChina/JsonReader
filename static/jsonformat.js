class JsonFormat{
    static getCurlyBrace(foldState,isLeft,layNumber){
        let curlyBrace = '';
        let currentLayerBlank='';
        for(let i=0;i<(layNumber-1);i++)
            currentLayerBlank+= '<tab></tab>';
        if(foldState){
            if(isLeft) {
                curlyBrace = '<p>' + currentLayerBlank + '<Button class="fold"></Button>{</p>';
            }
            else {
                curlyBrace = '<p>' + currentLayerBlank + '<Button class="fold"></Button>}</p>';
            }
        }else{
            if(isLeft) {
                curlyBrace = '<p>' + currentLayerBlank + '<Button class="unfold"></Button>{</p>';
            }
            else {
                curlyBrace = '<p>' + currentLayerBlank + '<Button class="unfold"></Button>}</p>';
            }
        }
        return curlyBrace;
    }
    static formatDisplayJson(foldState,jsonStr,displayId){
        let layerNumberList=[];
        let currentLayerNumber=0;
        let elementId='';
        let newElement=null;
        let keyIndex=0;
        let valueIndex=0;
        let curlyBraceIndex=0;

        // let printerIndex=0;
        try {
            console.log("json string length:",jsonStr.length);
            for (let index = 0; index < jsonStr.length; index++) {
                // printerIndex++;
                // if(printerIndex==1000){
                //     console.log("heart beat:",index);
                //     printerIndex=0;
                // }
                let char = jsonStr.charAt(index);
                switch (char) {
                    case '{':
                        currentLayerNumber += 1;
                        elementId = 'lCurlyBrace'+curlyBraceIndex.toString()+'In' + currentLayerNumber.toString();
                        layerNumberList.push(currentLayerNumber);
                        newElement = $(JsonFormat.getCurlyBrace(foldState, true, currentLayerNumber)).attr("id", elementId);
                        $(displayId).append(newElement);
                        curlyBraceIndex++;
                        break;
                    case '}':
                        elementId = 'rCurlyBrace'+curlyBraceIndex.toString()+'In' + currentLayerNumber.toString();
                        newElement = $(JsonFormat.getCurlyBrace(foldState, false, currentLayerNumber)).attr("id", elementId);
                        $(displayId).append(newElement);
                        if (currentLayerNumber >= 1)
                            currentLayerNumber -= 1;
                        curlyBraceIndex++;
                        break;
                    case '\"':
                        let keyResult = JsonFormat.getKey(index, jsonStr);
                        if (keyResult.end) {
                            elementId = 'keyValuePair' + keyIndex.toString() + 'In' + currentLayerNumber.toString();
                            newElement = $('<p></p>').attr('id', elementId);
                            //all the key value pairs under the same curly brace have the same class attr.
                            let className=JsonFormat.getCurrentKeyValueClassName(currentLayerNumber,curlyBraceIndex);
                            if(className.length>0)
                                newElement.addClass(className);
                            else
                                return {success: false, msg: "Failed to find right left curly brace!"};
                            elementId = 'key' + keyIndex.toString() + 'In' + currentLayerNumber.toString();
                            newElement.append($(JsonFormat.displayKey(keyResult.key, currentLayerNumber)).attr('id', elementId));
                            $(displayId).append(newElement);
                            keyIndex += 1;
                            index += keyResult.key.length + 1;
                        } else
                            return {success: false, msg: "Failed to get key!"};
                        break;
                    case ':' :
                        let valueResult = JsonFormat.getValue(':', index, jsonStr);
                        if (valueResult.end) {
                            elementId = 'value' + valueIndex.toString() + 'In' + currentLayerNumber.toString();
                            index += valueResult.value.length;
                            newElement.append($('<span>' + ':' + valueResult.value + '</span>').attr('id', elementId));
                            valueIndex += 1;
                        }
                        else
                            return {success: false, msg: "Failed to get value!"};
                        break;
                    case ',':
                        newElement.append('<span>,</span>');
                        break;

                }
            }
        }catch(e){
            return {success:false, msg: e.toString()};
        };
        let totalLayersNumber=Math.max(...layerNumberList);
        //key number = key Value Pairs Number
        return {success:true,totalLayersNumber:totalLayersNumber,keyValuePairsNumber:keyIndex,
                 curlyBracesNumber:curlyBraceIndex};
    };
     //find the left curly brace including to the key value pair.
    static getCurrentKeyValueClassName(currentLayerNumber,curlyBraceIndex){
        for(let i=(curlyBraceIndex-1);i>=0;i--){
            let curlyBraceId="#lCurlyBrace"+i.toString()+"In"+currentLayerNumber.toString();
            if($(curlyBraceId).length>0){
                return curlyBraceId.split("In")[0];
            }
        }
        return "";
    }
    static getKey(index,jsonStr){
        let key="";
        let endFlag=false;
        for(let i=(index+1);i<jsonStr.length;i++){
            if(jsonStr.charAt(i) != '\"')
                key+=jsonStr.charAt(i);
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
    static getValue(startChar,startIndex,jsonStr){
        let valueStr="";
        let arrayEndFlag=true;
        let doubleQuoteCount=0;
        let doubleQuoteEndFlag=true;
        let nestedCount=0;
        for(let i=startIndex+1;i<jsonStr.length;i++){
            if(jsonStr.charAt(i)=='\"' || !doubleQuoteEndFlag){
                if(doubleQuoteCount==1) {
                    doubleQuoteEndFlag = true;
                }
                else {
                    doubleQuoteEndFlag=false;
                    doubleQuoteCount++;
                }
            }
            if(doubleQuoteEndFlag){
                if(jsonStr.charAt(i)=='['){
                    nestedCount++;
                    arrayEndFlag=false;
                }
                else if((jsonStr.charAt(i)==']')) {
                    nestedCount--;
                    if(nestedCount==0)
                        arrayEndFlag = true;
                    else if(nestedCount<0)
                        break;
                }
                if( arrayEndFlag && (jsonStr.charAt(i)=='{' || jsonStr.charAt(i)=='}' || jsonStr.charAt(i)==','))
                    return { end:true, value: valueStr, endChar:jsonStr.charAt(i) };
            }
            valueStr+=jsonStr.charAt(i);
        }
        return {end: false};
    }
    static displayKey(key,layerNumber){
        let currentLayerBlank='';
        for(let i=0;i<layerNumber;i++)
            currentLayerBlank+= '<tab></tab>';
        return '<span>'+currentLayerBlank+'\"'+key+'\"'+'</span>';
    }
    static foldStateShift(event){
        let currentCurlyBraceId=event.data.curlyBraceId;
        let curlyBracesNumber=event.data.jsonStatistic.curlyBracesNumber;
        let foldAction=null;
        let currentElement = $(currentCurlyBraceId).find("Button");
        let removedAttr=null;
        let addedAttr=null;
        let partnerCurlyBraceId=JsonFormat.findPartnerCurlyBraceId(currentCurlyBraceId,curlyBracesNumber);
        let partnerElement=$(partnerCurlyBraceId).find('Button');
        if(currentElement.attr('class')=='unfold') {
            removedAttr='unfold';
            addedAttr='fold';
            foldAction=true;
        }else if(currentElement.attr('class')=='fold'){
            removedAttr='fold';
            addedAttr='unfold';
            foldAction=false;
        }
        currentElement.removeClass(removedAttr);
        currentElement.addClass(addedAttr);
        partnerElement.removeClass(removedAttr);
        partnerElement.addClass(addedAttr);
        let currentLeftCurlyBraceId=null;
        if(currentCurlyBraceId.charAt(1)=='l')
            currentLeftCurlyBraceId=currentCurlyBraceId;
        else
            currentLeftCurlyBraceId=partnerCurlyBraceId;
        JsonFormat.innerElementDisplayShift(event.data.jsonStatistic,currentLeftCurlyBraceId,foldAction);
    }

    static innerElementDisplayShift(jsonStatistic,currentLeftCurlyBraceId,foldAction){
        let currentKeyValuePairClass=currentLeftCurlyBraceId.split("In")[0];
        let currentLayerNumber=parseInt(currentLeftCurlyBraceId.split("In")[1]);
        let totalLayersNumber=jsonStatistic.totalLayersNumber;
        let curlyBracesNumber=jsonStatistic.curlyBracesNumber;
        let keyValuePairsNumber=jsonStatistic.keyValuePairsNumber;

        for(let i=currentLayerNumber;i<=totalLayersNumber;i++) {
            for (let j = 0; j < keyValuePairsNumber; j++) {
                let keyValueId = '#keyValuePair' + j.toString() + 'In' + i.toString();
                if( (i==currentLayerNumber && $(keyValueId).length > 0 && $(keyValueId).attr("class")==currentKeyValuePairClass)
                     ||(i!=currentLayerNumber && $(keyValueId).length > 0)){
                    if (foldAction)
                        $(keyValueId).hide();
                    else
                        $(keyValueId).show();
                }
            }
            if(i!=currentLayerNumber) {
                let prefix=['#lCurlyBrace','#rCurlyBrace'];
                for(let m=0;m<curlyBracesNumber;m++ ){
                    for(let k=0;k<2;k++){
                        let curlyBraceId = prefix[k] + m.toString()+'In'+i.toString();
                        if($(curlyBraceId).length>0) {
                            if (foldAction) {
                                $(curlyBraceId).find("Button").removeClass("unfold");
                                $(curlyBraceId).find("Button").addClass("fold");
                                $(curlyBraceId).hide();
                            } else {
                                $(curlyBraceId).find("Button").removeClass("fold");
                                $(curlyBraceId).find("Button").addClass("unfold");
                                $(curlyBraceId).show();
                            }
                        }
                    }
                }
            }
        }
    }
    static findPartnerCurlyBraceId(currentCurlyBraceId,curlyBracesNumber){
        let prefix=null;
        let currentLayerNumberStr=currentCurlyBraceId.split("In")[1];
        let currentCurlyBraceIndex=parseInt(currentCurlyBraceId.split("In")[0].substring(('#lCurlyBrace').length));
        let partnerCurlyBraceId=null;
        if(currentCurlyBraceId.charAt(1)=='l') {
            prefix = '#rCurlyBrace';
            for (let i = currentCurlyBraceIndex+1; i < curlyBracesNumber; i++) {
                partnerCurlyBraceId = prefix + i.toString() + "In" + currentLayerNumberStr;
                if ($(partnerCurlyBraceId).length > 0)
                    return partnerCurlyBraceId;
            }
        }
        else {
            prefix = '#lCurlyBrace';
            for (let i = currentCurlyBraceIndex-1; i>=0; i--) {
                partnerCurlyBraceId = prefix + i.toString() + "In" + currentLayerNumberStr;
                if ($(partnerCurlyBraceId).length > 0)
                    return partnerCurlyBraceId;
            }
        }
    }
    /* Element id map :
       { : leftCurlyBraceIn{layerNumber}
       } : rightCurlyBraceIn{layerNumber}
       key: key[0:]In{layerNumber}
       value: value[0:]In{layerNumber}            */
    static appendEvent(jsonStatistic){
        let prefix=["#lCurlyBrace","#rCurlyBrace"];
        for(let i=0;i<jsonStatistic.totalLayersNumber; i++){
            for(let k=0;k<jsonStatistic.curlyBracesNumber;k++){
                for(let j=0;j<2;j++){
                    let curlyBraceId=prefix[j]+k.toString()+"In"+(i+1).toString();
                    if($(curlyBraceId).length>0)
                        $(curlyBraceId).find("Button")
                            .click({jsonStatistic:jsonStatistic,curlyBraceId:curlyBraceId}, JsonFormat.foldStateShift);
                }
            }
        }
    }
}
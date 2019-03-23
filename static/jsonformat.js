class JsonFormat{
    static getCurlyBrace(foldState,layNumber,currentChar){
        let curlyBrace = '';
        let currentLayerBlank='';
        for(let i=0;i<(layNumber-1);i++)
            currentLayerBlank+= '<tab></tab>';
        if(foldState)
            curlyBrace = '<p>' + currentLayerBlank + '<Button class="fold"></Button>'+currentChar+'</p>';
        else
            curlyBrace = '<p>' + currentLayerBlank + '<Button class="unfold"></Button>'+currentChar+'</p>';
        return curlyBrace;
    }
    static formatDisplayJson(foldState,jsonStr,displayId){
        let layerIndexList=[];
        let currentLayerIndex=0;
        let elementId='';
        //first subscript - layerIndex, second subscript -element Index in current layer
        let elementsList=[];
        let newElement=null;
        let keyValueIndex=0;
        let curlyBraceIndex=0;
        let result=null;

        // let printerIndex=0;
        try {
            console.log("json string length:",jsonStr.length);
            for (let index = 0; index < jsonStr.length; index++) {
                // printerIndex++;
                // if(printerIndex==1000){
                //     console.log("heart beat:",index);
                //     printerIndex=0;
                // }
                let currentLayerBlank='';
                let char = jsonStr.charAt(index);
                switch (char) {
                    case '{':
                    case '[':
                        currentLayerIndex += 1;
                        layerIndexList.push(currentLayerIndex);
                        JsonFormat.displayCurlyBrace(curlyBraceIndex,currentLayerIndex,foldState,displayId,char,'lCurlyBrace');
                        curlyBraceIndex++;
                        result=JsonFormat.displayKeyValue(index,jsonStr,keyValueIndex,currentLayerIndex,curlyBraceIndex,displayId);
                        keyValueIndex=result.keyValueIndex;
                        index=result.index;
                        newElement=result.newElement;
                        break;
                    case '}':
                    case ']':
                        newElement=JsonFormat.displayCurlyBrace(curlyBraceIndex,currentLayerIndex,foldState,displayId,char,'rCurlyBrace');
                        if (currentLayerIndex >= 1)
                            currentLayerIndex -= 1;
                        curlyBraceIndex++;
                        break;
                    case ',':
                        newElement.append('<span>,</span>');
                        result=JsonFormat.displayKeyValue(index,jsonStr,keyValueIndex,currentLayerIndex,curlyBraceIndex,displayId);
                        keyValueIndex=result.keyValueIndex;
                        index=result.index;
                        newElement=result.newElement;
                        break;
                }
            }
        }catch(e){
            return {success:false, msg: e.toString()};
        };
        let totalLayersNumber=Math.max(...layerIndexList);
        //key number = key Value Pairs Number
        return {success:true,totalLayersNumber:totalLayersNumber,keyValuePairsNumber:keyValueIndex,
                 curlyBracesNumber:curlyBraceIndex};
    };
    static displayCurlyBrace(curlyBraceIndex,currentLayerIndex,foldState,parentId,char,idPrefix){
        let elementId = idPrefix+curlyBraceIndex.toString()+'In' + currentLayerIndex.toString();
        let newElement = $(JsonFormat.getCurlyBrace(foldState,currentLayerIndex,char)).attr("id", elementId);
        $(parentId).append(newElement);
        return newElement;
    }
    static displayKeyValue(index,jsonStr,keyValueIndex,currentLayerIndex,curlyBraceIndex,parentId){
        let elementId=null;
        let currentLayerBlank='';
        let newElement=null;
        let result=JsonFormat.getKeyValue(index+1,jsonStr);
        if(result.success && result.value.length!=0){
            let elementId = 'keyValuePair' + keyValueIndex.toString() + 'In' + currentLayerIndex.toString();
            for(let i=0;i<currentLayerIndex;i++)
                currentLayerBlank+= '<tab></tab>';
            newElement = $('<p></p>').append($(currentLayerBlank)).attr('id', elementId);
            newElement.append(result.value);
            //all the key value pairs under the same curly brace have the same class attr.
            let className=JsonFormat.getCurrentKeyValueClassName(currentLayerIndex,curlyBraceIndex);
            if(className.length>0)
                newElement.addClass(className);
            else
                return {success: false, msg: "Failed to find right left curly brace!"};
            $(parentId).append(newElement);
            keyValueIndex += 1;
        };
        index += result.value.length;
        return {newElement:newElement,keyValueIndex:keyValueIndex, index:index}
    }
     //find the left curly brace including to the key value pair.
    static getCurrentKeyValueClassName(currentLayerIndex,curlyBraceIndex){
        for(let i=(curlyBraceIndex-1);i>=0;i--){
            let curlyBraceId="#lCurlyBrace"+i.toString()+"In"+currentLayerIndex.toString();
            if($(curlyBraceId).length>0){
                return curlyBraceId.split("In")[0];
            }
        }
        return "";
    }
    static getSubStrBetweenDoubleQuotation(index,str){
        let startIndex=0,endIndex=0;
        let substr="";
        let doubleQuotationCount=0;
        for(let i=index;i<str.length;i++){
            if(str.charAt(i)=='\"' && doubleQuotationCount!=2)
                doubleQuotationCount++;
            if(doubleQuotationCount!=0){
                substr += str.charAt(i);
                if (doubleQuotationCount == 2)
                    break;
            }
        }
        if(doubleQuotationCount==0)
            return { success:true,value:null};
        else if(doubleQuotationCount==2)
            return { success:true, value: substr};
        else
            return {success:false};
    }
    static indentStr(str){
        for(let i=0;i<str.length;i++){
            if(str.charAt(i)!==' ' && str.charAt(i)!=='\r' && str.charAt(i)!=='\n')
                break;
        }
        return str.substring(i);
    }
    static getKeyValue(index,str){
        let startIndex=index;
        let endIndex=index;
        for(let i=index;i<str.length;i++){
            switch(str.charAt(i)) {
                case '[':
                case '{':
                case ',':
                case ']':
                case '}':
                    return {success:true,value:str.substring(index,i)};
                case '\"': //string value
                    if(!JsonFormat.getSubStrBetweenDoubleQuotation(i,str).success)
                        return {success:false};
                    else{
                        i+=JsonFormat.getSubStrBetweenDoubleQuotation(i,str).value.length-1;
                        continue;
                    }
            }
        }
        return {success:false};
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
        let currentLayerIndex=parseInt(currentLeftCurlyBraceId.split("In")[1]);
        let totalLayersNumber=jsonStatistic.totalLayersNumber;
        let curlyBracesNumber=jsonStatistic.curlyBracesNumber;
        let keyValuePairsNumber=jsonStatistic.keyValuePairsNumber;

        for(let i=currentLayerIndex;i<=totalLayersNumber;i++) {
            for (let j = 0; j < keyValuePairsNumber; j++) {
                let keyValueId = '#keyValuePair' + j.toString() + 'In' + i.toString();
                if( (i==currentLayerIndex && $(keyValueId).length > 0 && $(keyValueId).attr("class")==currentKeyValuePairClass)
                     ||(i!=currentLayerIndex && $(keyValueId).length > 0)){
                    if (foldAction)
                        $(keyValueId).hide();
                    else
                        $(keyValueId).show();
                }
            }
            if(i!=currentLayerIndex) {
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
        let currentLayerIndexStr=currentCurlyBraceId.split("In")[1];
        let currentCurlyBraceIndex=parseInt(currentCurlyBraceId.split("In")[0].substring(('#lCurlyBrace').length));
        let partnerCurlyBraceId=null;
        if(currentCurlyBraceId.charAt(1)=='l') {
            prefix = '#rCurlyBrace';
            for (let i = currentCurlyBraceIndex+1; i < curlyBracesNumber; i++) {
                partnerCurlyBraceId = prefix + i.toString() + "In" + currentLayerIndexStr;
                if ($(partnerCurlyBraceId).length > 0)
                    return partnerCurlyBraceId;
            }
        }
        else {
            prefix = '#lCurlyBrace';
            for (let i = currentCurlyBraceIndex-1; i>=0; i--) {
                partnerCurlyBraceId = prefix + i.toString() + "In" + currentLayerIndexStr;
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
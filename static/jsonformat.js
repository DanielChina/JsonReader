class JsonFormat{
    static getCurlyBrace(defaultFold,isLeft,layNumber){
        let curlyBrace = '';
        let currentLayerBlank='';
        for(let i=0;i<(layNumber-1);i++)
            currentLayerBlank+= '<tab></tab>';
        if(defaultFold){
            if(isLeft)
                curlyBrace = '<p>'+currentLayerBlank+'<Button class="unfoldButton" id="foldSwift"></Button>{</p>';
            else
                curlyBrace = '<p>'+currentLayerBlank+'<Button class="unfoldButton" id="foldSwift"></Button>}</p>';
        }else{
            if(isLeft)
                curlyBrace = '<p>'+currentLayerBlank+'<Button class="foldButton" id="foldSwift"></Button>{</p>';
            else
                curlyBrace = '<p>'+currentLayerBlank+'<Button class="foldButton" id="foldSwift"></Button>}</p>';
        }
        return curlyBrace;
    }
    static formatDisplayJson(defaultFold,jsonString){
        let displayStr = '';
        let layerNumberList=[];
        let currentLayerNumber=0;
        let strArray=jsonString.split('');
        for(let index=0;index<strArray.length;index++){
            let char=strArray[index];
            switch(char){
                case '{':
                    currentLayerNumber+=1;
                    displayStr+=JsonFormat.getCurlyBrace(defaultFold,true,currentLayerNumber);
                    layerNumberList.push(currentLayerNumber);
                    break;
                case '}':
                    displayStr+=JsonFormat.getCurlyBrace(defaultFold,false,currentLayerNumber);
                    if(currentLayerNumber>=1)
                        currentLayerNumber-=1;
                    break;
                case '\"':
                    let keyResult=JsonFormat.getKey(index, strArray);
                    if(keyResult.end) {
                        index +=keyResult.key.length;
                        displayStr += '<p>' + keyResult.key;
                    }else
                        return {success:false,msg:"Failed to get key!"};
                    break;
                case ':' :
                    displayStr+=':';
                    let valueResult=JsonFormat.getValue(':',index,strArray);
                    if(valueResult.end) {
                        index+=valueResult.value.length;
                        displayStr += valueResult.value + '</p>';
                    }
                    else
                        return {success:false, msg:"Failed to get value!"};
                    break;
            }
        }
        let totalLayersNumber=Math.max(...layerNumberList);
        return {
            displayStr:displayStr,
            totalLayersNumber:totalLayersNumber
        };
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
            return { end:true, key:'\"'+key+'\"'};
        else
            return { end:false };
    };
    static getValue(startChar,startIndex,strArray){
        let valueStr="";
        for(let i=startIndex+1;i<strArray.length;i++){
            if(strArray[i]=='{' || strArray[i]=='}' || strArray[i]==',')
                return { end:true, value: valueStr }; //need line break
            else
                valueStr+=strArray[i];
        }
        return {lineBreak: false};
    }
}
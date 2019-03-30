from flask import Flask,render_template, jsonify,request

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('test.html')


@app.route('/jsonRequest', methods=['POST'])
def requestJson():
    data=request.json;
    try:
        fp=open(data['path'],'r')
        data=fp.read()
        fp.close()
        if(len(data)==0):
            return jsonify({"success":False,"msg":"Json file length is zero!" })
        return jsonify({"success":True,"data":data})
    except:
        return jsonify({"success":False,"msg":"Failed to open json file!"})

@app.route('/jsonCover', methods=['POST'])
def coverJsonFile():
    data=request.json;
    try:
        fp=open(data['path'],'w')
        fp.write(data['data'])
        fp.close()
        return jsonify({"msg":"Success to compact json file!"})
    except:
        return jsonify({"msg":"Fail to open json file!"})

if __name__ == '__main__':
    app.run()

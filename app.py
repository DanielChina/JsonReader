from flask import Flask,render_template, jsonify

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('test.html')


@app.route('/jsonRequest', methods=['POST'])
def requestJson():
    try:
        fp=open('E:\\aa.json','r')
        data=fp.read()
        fp.close()
    except:
        data=''
        print("Failed to open json file!")
    return jsonify(data)


if __name__ == '__main__':
    app.run()

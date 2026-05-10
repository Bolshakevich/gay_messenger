from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return {'message': 'Сервер гей мессенджера передает привет'}

if __name__ == '__main__':
    app.run(debug=True)
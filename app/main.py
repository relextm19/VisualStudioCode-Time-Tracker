from flask import Flask, request, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'secret'

CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

db = SQLAlchemy(app)

class language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)

absolute_total_time = 0.00

@app.route('/updateTime', methods=['POST'])
def update():
    global absolute_total_time
    data = request.get_json()
    language_name = data['name']
    language_time = data['time']
    language_ = language.query.filter_by(name=language_name).first()
    if language_:
        absolute_total_time -= int(language_.time)
        language_.time = language_time
        db.session.commit()
        absolute_total_time += int(language_time)
        
        socketio.emit('update', {"name": language_name, "time": language_time, "total_time" : f"{absolute_total_time / 3600:.2f}"})        

        return jsonify({200: 'Updated'})
    else:
        return jsonify({404: 'Not Found'})

    
@app.route('/getTime', methods=['POST'])
def getTime():
    data = request.get_json()
    language_name = data['name']
    language_ = language.query.filter_by(name=language_name).first()
    if language_:
        return jsonify({200: language_.time})
    else:
        new_language = language(name=language_name, time='0')
        db.session.add(new_language)
        db.session.commit()
        return jsonify({201: 'created'})
    
@app.route('/')
def dashboard():
    global absolute_total_time
    langs = language.query.all()
    lang_stats = []
    langs.sort(key=lambda x: int(x.time), reverse=True)
    absolute_total_time = sum(time for time in [int(lang.time) for lang in langs])
    for lang in langs:
        time = int(lang.time)
        formated_time = format_time(time)
        lang_stats.append({'name': lang.name, 'time': f'{formated_time}'})
    
    return render_template('dashboard.html', lang_stats=lang_stats, total_time=f"{absolute_total_time / 3600:.2f}")

def format_time(time):
    hours = time // 3600
    minutes = (time % 3600) // 60
    seconds = time % 60
    return f'{hours}h:{minutes}m:{seconds}s'

if __name__ == '__main__':
    socketio.run(app, debug=True)
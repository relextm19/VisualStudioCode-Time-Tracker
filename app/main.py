from flask import Flask, request, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from werkzeug.security import generate_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
app.secret_key = 'secret'
socketio = SocketIO(app)

class language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)

@app.route('/updateTime', methods=['POST'])
def update():
    data = request.get_json()
    language_name = data['name']
    language_time = data['time']
    language_ = language.query.filter_by(name=language_name).first()
    if language_:
        language_.time = language_time
        db.session.commit()
        print(f'Updated {language_name} time {language_time}')
        socketio.emit('update', {language_name: language_time})        
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
    langs = language.query.all()
    lang_stats = []
    absolute_total_time = 0.00
    langs.sort(key=lambda x: int(x.time), reverse=True)
    for lang in langs:
        total_time_s = int(lang.time)
        hours = total_time_s // 3600
        minutes = (total_time_s % 3600) // 60
        seconds = total_time_s % 60
        absolute_total_time += total_time_s
        lang_stats.append({'name': lang.name, 'time': f'{hours}h:{minutes}m:{seconds}s'})
    
    return render_template('dashboard.html', lang_stats=lang_stats, total_time=f"{absolute_total_time / 3600:.2f}")


if __name__ == '__main__':
    app.run(debug=True)
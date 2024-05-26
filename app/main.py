from flask import Flask, request, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'secret'

CORS(app)

db = SQLAlchemy(app)

class language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)

class project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)

absolute_total_time = 0.00

@app.route('/updateLangTime', methods=['POST'])
def update():
    global absolute_total_time
    data = request.get_json()
    language_name = data['name']
    language_time = data['time']
    language_ = language.query.filter_by(name=language_name).first()

    if language_:
        absolute_total_time -= int(language_.time)
        language_.time = int(language_.time) + int(language_time)
        db.session.commit()

        absolute_total_time += int(language_time)
        
        return jsonify({200: 'Updated'})
    else:
        new_language = language(name=language_name, time=language_time)
        db.session.add(new_language)
        db.session.commit()
        absolute_total_time += int(language_time)
        return jsonify({201: 'created'})

@app.route('/updateProjectTime', methods=['POST'])
def updateProjectTime():
    data = request.get_json()
    project_name = data['name']
    project_time = data['time']
    project_ = project.query.filter_by(name=project_name).first()
    if project_:
        project_.time = int(project_.time) + int(project_time)
        db.session.commit()
        return jsonify({200: 'Updated'})
    else:
        new_project = project(name=project_name, time=project_time)
        db.session.add(new_project)
        db.session.commit()
        return jsonify({201: 'created'})

@app.route('/updateActiveLanguage', methods=['POST'])
def update_active_language():
    data = request.get_json()
    language_name = data['name']

    if language_name == 'None':
        socketio.emit('update', {'name': 'None'})
        return jsonify({200: 'Ok'})

    language_ = language.query.filter_by(name=language_name).first()
    if language_:
        socketio.emit('update', {'name': language_name})
        return jsonify({200: 'Ok'})
    else:
        new_language = language(name=language_name, time=0)
        db.session.add(new_language)
        db.session.commit()
        socketio.emit('update', {'name': language_name})
        return jsonify({201: 'Created'})
    
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
        lang_stats.append({'name': lang.name, 'time': f'{time}'})
    
    return render_template('dashboard.html', lang_stats=lang_stats, total_time=f"{absolute_total_time / 3600:.2f}")

def format_time(time):
    hours = time // 3600
    minutes = (time % 3600) // 60
    seconds = time % 60
    return f'{hours}h:{minutes}m:{seconds}s'

if __name__ == '__main__':
    app.run(debug=True)
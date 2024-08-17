from flask import Flask, request, render_template, jsonify, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import hashlib
import time

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = r'sqlite:///C:/Users/Mateusz/Desktop/code/VScodeTimeTracker/app/db/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'secret'
CORS(app)

db = SQLAlchemy(app)

class Sessions(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    startDate = db.Column(db.String(100), nullable=False)
    endDate = db.Column(db.String(100), nullable=False)
    language = db.Column(db.String(100), nullable=False)
    project = db.Column(db.String(100))
    startTime = db.Column(db.Integer)
    endTime = db.Column(db.Integer)

started_sessions = {}
invalid_languages = {
    "none",
    "markdown",
    "json",
    "plaintext",
    ".gitignore",
    "yaml",
    "dockerfile",
    "ignore",
    "shellscript",
    "bash"
}

@app.route('/startSession', methods=['POST'])
def start_session():
    data = request.get_json()
    language_name = data.get('language')
    project_name = data.get('project')
    starting_time = data.get('startTime')
    startDate = data.get('startDate')
    if not language_name or not starting_time or not startDate or not project_name:
        return jsonify({'message': 'Invalid data'}), 400
    try:
        if language_name in invalid_languages:
            return jsonify({'message': 'Invalid language'}), 400
        session_id = hashlib.md5(f'{language_name}{starting_time}{startDate}'.encode()).hexdigest()
        db.session.add(Sessions(id=session_id, startTime=starting_time, language = language_name, project = project_name, startDate=startDate))
        db.session.commit()
        started_sessions[language_name] = session_id

    except Exception as e:
        print(e)
        return jsonify({'message': 'An error occurred'}), 500
    
    return jsonify({'message': 'Session created'}), 201

@app.route('/endSession', methods=['POST'])
def end_session():
    data = request.get_json()
    language_name = data.get('language')
    end_time = data.get('endTime')
    end_date = data.get('endDate')
    
    if not language_name or not end_time or not end_date:
        return jsonify({'message': 'Invalid data'}), 400
    try:
        if language_name not in started_sessions:
            return jsonify({'message': 'Session not found'}), 404
        session_id = started_sessions[language_name]
        session = Sessions.query.filter_by(id=session_id).first()
        if not session:
            return jsonify({'message': 'Session not found'}), 404
        
        session.endTime = end_time
        session.endDate = end_date
        db.session.commit()
        started_sessions.pop(language_name)
    except Exception as e:
        print(e)
        return jsonify({'message': 'An error occurred'}), 500

    return jsonify({'message': 'Session ended'}), 200

@app.route('/')
def home():
    return redirect('/languages')

@app.route('/languages')
def languages():
    language_times = {}
    total_time = 0
    current_time = int(time.time() * 1000)
    for session in Sessions.query.all():
        #prepare session dict
        if session.language not in language_times:
            language_times[session.language] = 0
        #handle closed sessions
        if session.endTime:
            session_time = (session.endTime - session.startTime) / 1000
            language_times[session.language] += session_time
            total_time += session_time
        #handle open sessions
        else:
            session_time = (current_time - session.startTime) / 1000
            if session.language not in started_sessions:
                started_sessions[session.language] = session.id
            language_times[session.language] += session_time
            total_time += session_time
    #sort languages by time
    language_times = dict(sorted(language_times.items(), key=lambda item: item[1], reverse=True))
    print(language_times)
    return render_template('languages.html', language_times=language_times, total_time=total_time)

@app.route('/projects')
def projects():
    try:
        projects = {}
        total_time = 0
        results = db.session.query(
            Sessions.project,
            db.func.sum(Sessions.endTime - Sessions.startTime).label('total_time')
        ).filter(Sessions.project.isnot(None)).group_by(Sessions.project).all()

        for result in results:
            projects[result.project] = result.total_time / 1000
            total_time += result.total_time / 1000

        # Sort projects by time
        projects = dict(sorted(projects.items(), key=lambda item: item[1], reverse=True))

        return render_template('projects.html', projects=projects, total_time=total_time)
    except Exception as e:
        print(e)
        return jsonify({'message': 'An error occurred'}), 500
    
def format_time(time):
    hours = time // 3600
    minutes = (time % 3600) // 60
    seconds = time % 60
    return f'{hours}h:{minutes}m:{seconds}s'


if __name__ == '__main__':
    app.run(debug=True)
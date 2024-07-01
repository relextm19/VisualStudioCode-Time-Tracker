from flask import Flask, request, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
import hashlib

app = Flask(__name__)
socketio = SocketIO(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'secret'

CORS(app)
db = SQLAlchemy(app)

class Sessions(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    startDate = db.Column(db.String(100), nullable=False)
    endDate = db.Column(db.String(100), nullable=False)
    language = db.Column(db.String(100), nullable=False)
    startTime = db.Column(db.Integer)
    endTime = db.Column(db.Integer)

started_sessions = {}

@app.route('/startSession', methods=['POST'])
def start_session():
    data = request.get_json()
    if 'name' not in data or 'startTime' not in data or 'startDate' not in data:
        return jsonify({'message': 'Invalid data'}), 400
    try:
        language_name = data['name']
        starting_time = data['startTime']
        startDate = data['startDate']
        session_id = hashlib.md5(f'{language_name}{starting_time}{startDate}'.encode()).hexdigest()
        session_id = session_id[:10]
        db.session.add(Sessions(id=session_id, startTime=starting_time, language = language_name, startDate=startDate))
        db.session.commit()

        started_sessions[session_id] = starting_time
    except Exception as e:
        print(e)
        return jsonify({'message': 'An error occurred'}), 500

    return jsonify({'session_id': session_id}), 201

@app.route('/endSession', methods=['POST'])
def end_session():
    data = request.get_json()
    if 'session_id' not in data or 'endTime' not in data or 'endDate' not in data:
        return jsonify({'message': 'Invalid data'}), 400
    try:
        session_id = data['session_id']
        end_time = data['endTime']
        end_date = data['endDate']
        session = Sessions.query.filter_by(id=session_id).first()
        session.endTime = end_time
        session.endDate = end_date
        db.session.commit()
    except Exception as e:
        print(e)
        return jsonify({'message': 'An error occurred'}), 500
    
    return jsonify({'message': 'Session ended'}), 200

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

def format_time(time):
    hours = time // 3600
    minutes = (time % 3600) // 60
    seconds = time % 60
    return f'{hours}h:{minutes}m:{seconds}s'

if __name__ == '__main__':
    app.run(debug=True)
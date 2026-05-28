import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pydub import AudioSegment
from stt_service import transcribe_audio
from database import init_db, save_transcript, get_all_transcripts, delete_transcript

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for Next.js frontend running locally
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize database schema on startup
init_db()

def process_audio_file(file_path: str) -> str:
    """
    Converts incoming audio to a standard 16kHz mono WAV format using pydub.
    Falls back to the original file if conversion fails (e.g. if ffmpeg is missing).
    """
    try:
        base_path, _ = os.path.splitext(file_path)
        target_path = f"{base_path}_processed.wav"
        
        logger.info(f"Converting audio file {file_path} to 16kHz mono WAV...")
        sound = AudioSegment.from_file(file_path)
        sound = sound.set_frame_rate(16000).set_channels(1)
        sound.export(target_path, format="wav")
        
        logger.info(f"Successfully processed audio. Target path: {target_path}")
        return target_path
    except Exception as e:
        logger.warning(f"Audio processing failed (pydub/ffmpeg error): {str(e)}. Falling back to raw file.")
        return file_path

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple API health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'EchoScribe Backend'
    }), 200

@app.route('/api/transcribe', methods=['POST'])
def upload_audio():
    """Accepts multipart form audio files, processes them, and transcribes them."""
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file found in the request'}), 400

    audio_file = request.files['file']
    if audio_file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        # Secure filename fallback and generation
        filename = audio_file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save raw file to temporary server folder
        logger.info(f"Saving raw upload to {file_path}")
        audio_file.save(file_path)

        # Day 7: Preprocess audio (convert format)
        processed_path = process_audio_file(file_path)

        # Day 5 & 6: Transcribe audio
        transcript = transcribe_audio(processed_path)

        # Clean up temporary files to save server space (except the uploaded raw logs)
        if processed_path != file_path and os.path.exists(processed_path):
            try:
                os.remove(processed_path)
            except Exception as cleanup_err:
                logger.error(f"Failed to clean up processed file: {cleanup_err}")

        return jsonify({
            'status': 'success',
            'transcript': transcript,
            'filename': filename,
            'path': file_path
        }), 200

    except Exception as e:
        logger.error(f"Error saving/processing uploaded file: {str(e)}")
        return jsonify({'error': f"Failed to save/process file: {str(e)}"}), 500

@app.route('/api/transcripts', methods=['GET'])
def list_transcripts():
    """Retrieves all saved transcripts, with optional text query filtering."""
    search_query = request.args.get('q', None)
    records = get_all_transcripts(search_query)
    return jsonify(records), 200

@app.route('/api/transcripts', methods=['POST'])
def create_transcript_record():
    """Saves a new transcript record to the database."""
    data = request.get_json() or {}
    text = data.get('text')
    duration = data.get('duration')
    filename = data.get('filename', '')

    if not text or duration is None:
        return jsonify({'error': 'Missing text or duration parameters'}), 400

    record = save_transcript(text, int(duration), filename)
    if record:
        return jsonify(record), 201
    return jsonify({'error': 'Failed to save transcript to database'}), 500

@app.route('/api/transcripts/<int:record_id>', methods=['DELETE'])
def remove_transcript_record(record_id):
    """Deletes a transcript record from the database by its ID."""
    success = delete_transcript(record_id)
    if success:
        return jsonify({'message': f'Transcript record {record_id} successfully deleted.'}), 200
    return jsonify({'error': f'Failed to delete record {record_id} or not found.'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Run server locally on port 5000
    app.run(host='0.0.0.0', port=port, debug=True)

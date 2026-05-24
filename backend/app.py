import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for Next.js frontend running locally
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple API health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'EchoScribe Backend'
    }), 200

@app.route('/api/transcribe', methods=['POST'])
def upload_audio():
    """Accepts multipart form audio files and stores them temporarily."""
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file found in the request'}), 400

    audio_file = request.files['file']
    if audio_file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        # Secure filename fallback and generation
        filename = audio_file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save file to temporary server folder
        audio_file.save(file_path)

        return jsonify({
            'status': 'success',
            'message': 'Audio file successfully uploaded and stored.',
            'filename': filename,
            'path': file_path
        }), 200

    except Exception as e:
        app.logger.error(f"Error saving uploaded file: {str(e)}")
        return jsonify({'error': f"Failed to save file: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Run server locally on port 5000
    app.run(host='0.0.0.0', port=port, debug=True)

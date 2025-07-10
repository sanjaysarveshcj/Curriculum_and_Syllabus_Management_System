from flask import Flask, request, send_file
from flask_cors import CORS
from docx import Document
from docx.shared import Pt
import requests
import io

app = Flask(__name__)
CORS(app)

@app.route('/merge-first-syllabus', methods=['POST'])
def merge_first_syllabus():
    data = request.json
    title = data['title']
    syllabus_url = data['syllabusUrl']
    
    # Fetch the syllabus file from the provided URL
    response = requests.get(syllabus_url)
    if not response.ok:
        return {"error": f"Failed to fetch syllabus: {response.status_code}"}, 500
    
    syllabus_bytes = response.content
    
    # Load the syllabus document
    doc = Document(io.BytesIO(syllabus_bytes))
    
    # Insert a new paragraph at the very beginning
    first_paragraph = doc.paragraphs[0]
    # Create a new paragraph before the first one
    new_paragraph = first_paragraph.insert_paragraph_before(title)
    new_paragraph.runs[0].font.name = 'Cambria'
    new_paragraph.runs[0].font.size = Pt(11)
    new_paragraph.runs[0].font.bold=True  # Slightly larger to look like a title
    
    # Save the modified document to a buffer
    merged_buffer = io.BytesIO()
    doc.save(merged_buffer)
    merged_buffer.seek(0)
    
    # Return the modified file
    return send_file(
        merged_buffer,
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        as_attachment=True,
        download_name='merged.docx'
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

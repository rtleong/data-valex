from flask import Flask, request, render_template, redirect, url_for
from markupsafe import escape
import pandas as pd
import great_expectations as ge
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        return redirect(request.url)
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        validation_result = validate_dataset(file_path)
        return render_template('result.html', result=validation_result)

def validate_dataset(file_path):
    # Load the dataset
    df = pd.read_csv(file_path)
    # Convert to Great Expectations DataFrame
    ge_df = ge.from_pandas(df)
    
    # Define expectations
    #fuzzy support after
    expectations = [
        ge_df.expect_column_to_exist('column_name'),
        ge_df.expect_column_values_to_be_between('column_name', min_value=0, max_value=100),
        # Add more expectations as needed
    ]
    
    # Run validation
    results = [exp['success'] for exp in expectations]
    return all(results)

if __name__ == '__main__':
    app.run(debug=True)
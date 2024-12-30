from flask import Flask, jsonify, render_template
import json

app = Flask(__name__)

# Load questions from JSON file
with open("static/questions.json", "r") as f:
    questions = json.load(f)

@app.route("/")
def home():
    return render_template("quiz.html", total_questions=len(questions))

@app.route("/get_question/<int:question_id>")
def get_question(question_id):
    if 0 <= question_id < len(questions):
        return jsonify(questions[question_id])
    else:
        return jsonify({})  # Return empty if out of range

@app.route("/get_questions")
def get_questions():
    return jsonify(questions)

if __name__ == "__main__":
    app.run(debug=True)

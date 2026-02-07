from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for localhost:3000

@app.route('/api/quantum-prize', methods=['GET'])
def quantum_prize():
    # 50% chance for LEGENDARY, 50% for COMMON
    is_legendary = random.random() < 0.5
    
    if is_legendary:
        return jsonify({
            "type": "LEGENDARY",
            "message": "🎉 Amazing! You found a LEGENDARY prize!",
            "reward": "100 XP + 10 Stars!"
        })
    else:
        return jsonify({
            "type": "COMMON",
            "message": "Nice! You got a common prize!",
            "reward": "10 XP + 1 Star"
        })

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
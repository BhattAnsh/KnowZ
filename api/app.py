import os
import logging
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from arango import ArangoClient
from dotenv import load_dotenv
import traceback
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-dev-key')
# Make JWT tokens never expire
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

jwt = JWTManager(app)

db = None
users = None
skills = None
graph = None
matches = None
messages = None
db_connected = False

try:
    ARANGO_URL = os.getenv("ARANGO_URL")
    ARANGO_DB_NAME = os.getenv("ARANGO_DB_NAME")
    ARANGO_USERNAME = os.getenv("ARANGO_USERNAME")
    ARANGO_PASSWORD = os.getenv("ARANGO_PASSWORD")
    
    client = ArangoClient(hosts=ARANGO_URL)
    
    sys_db = client.db('_system', username=ARANGO_USERNAME, password=ARANGO_PASSWORD)
    
    if not sys_db.has_database(ARANGO_DB_NAME):
        logger.info(f"Database {ARANGO_DB_NAME} not found, creating it...")
        sys_db.create_database(ARANGO_DB_NAME)
        logger.info(f"Database {ARANGO_DB_NAME} created successfully")
    
    db = client.db(ARANGO_DB_NAME, username=ARANGO_USERNAME, password=ARANGO_PASSWORD)
    
    if not db.has_collection('users'):
        users = db.create_collection('users')
        logger.info("Created 'users' collection")
    else:
        users = db.collection('users')
        logger.info("Using existing 'users' collection")
    
    if not db.has_collection('skills'):
        skills = db.create_collection('skills')
        logger.info("Created 'skills' collection")
    else:
        skills = db.collection('skills')
        logger.info("Using existing 'skills' collection")
    
    if not db.has_graph('skill_graph'):
        graph = db.create_graph('skill_graph')
        logger.info("Created 'skill_graph' graph")
        
        if not graph.has_vertex_collection('users'):
            graph.create_vertex_collection('users')
        if not graph.has_vertex_collection('skills'):
            graph.create_vertex_collection('skills')
        
        if not graph.has_edge_definition('has_skill'):
            graph.create_edge_definition(
                edge_collection='has_skill',
                from_vertex_collections=['users'],
                to_vertex_collections=['skills']
            )
        if not graph.has_edge_definition('wants_to_learn'):
            graph.create_edge_definition(
                edge_collection='wants_to_learn',
                from_vertex_collections=['users'],
                to_vertex_collections=['skills']
            )
    else:
        graph = db.graph('skill_graph')
        logger.info("Using existing 'skill_graph' graph")
    
    if not db.has_collection('matches'):
        matches = db.create_collection('matches')
        logger.info("Created 'matches' collection")
    else:
        matches = db.collection('matches')
        logger.info("Using existing 'matches' collection")

    if not db.has_collection('messages'):
        messages = db.create_collection('messages')
        logger.info("Created 'messages' collection")
    else:
        messages = db.collection('messages')
        logger.info("Using existing 'messages' collection")
    
    logger.info("ArangoDB setup completed successfully")
    db_connected = True
    
except Exception as e:
    logger.error(f"Error setting up ArangoDB: {e}")
    db_connected = False

@app.route('/register', methods=['POST'])
def register():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        data = request.get_json()
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing required fields"}), 400
        
        existing = users.find({'username': data['username']})
        if next(existing, None):
            return jsonify({"error": "Username already exists"}), 400
        
        user = {
            'username': data['username'],
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'primary_skill': data.get('primary_skill', ''),
            'secondary_skill': data.get('secondary_skill', ''),
            'learning_goal': data.get('learning_goal', '')
        }
        
        meta = users.insert(user)
        user_key = meta['_key']
        
        if data.get('primary_skill'):
            skill_id = data['primary_skill'].replace(" ", "_").lower()
            try:
                if not skills.has(skill_id):
                    skills.insert({
                        '_key': skill_id,
                        'name': data['primary_skill'],
                        'category': 'Technical'
                    })
            except:
                pass
                
            has_skill = graph.edge_collection('has_skill')
            has_skill.insert({
                '_from': f'users/{user_key}',
                '_to': f'skills/{skill_id}',
                'proficiency': 5
            })
        
        if data.get('learning_goal'):
            skill_id = data['learning_goal'].replace(" ", "_").lower()
            try:
                if not skills.has(skill_id):
                    skills.insert({
                        '_key': skill_id,
                        'name': data['learning_goal'],
                        'category': 'Technical'
                    })
            except:
                pass
                
            wants_to_learn = graph.edge_collection('wants_to_learn')
            wants_to_learn.insert({
                '_from': f'users/{user_key}',
                '_to': f'skills/{skill_id}'
            })
        
        return jsonify({"message": "User created successfully", "user_id": user_key}), 201
    
    except Exception as e:
        logger.error(f"Error in registration: {e}")
        return jsonify({"error": "Registration failed. Please try again."}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({"error": "Missing username or password"}), 400
        
        cursor = users.find({'username': data['username']})
        user = next(cursor, None)
        
        if not user or not check_password_hash(user['password'], data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        access_token = create_access_token(identity=user['_key'])
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user['_key'],
            "username": user['username']
        })
    
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({"error": "Login failed. Please try again."}), 500

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        user = users.get({'_key': user_key})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user.pop('password', None)
        
        aql = """
        WITH users, skills, has_skill, wants_to_learn
        LET user_skills = (
            FOR skill IN OUTBOUND CONCAT('users/', @user_key) has_skill
            RETURN {
                id: skill._key,
                name: skill.name,
                category: skill.category
            }
        )
        
        LET learning_goals = (
            FOR skill IN OUTBOUND CONCAT('users/', @user_key) wants_to_learn
            RETURN {
                id: skill._key,
                name: skill.name,
                category: skill.category
            }
        )
        
        RETURN {
            user: @user,
            skills: user_skills,
            learning_goals: learning_goals
        }
        """
        
        cursor = db.aql.execute(aql, bind_vars={'user_key': user_key, 'user': user})
        profile = next(cursor)
        
        return jsonify(profile)
    
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        return jsonify({"error": "Could not retrieve profile"}), 500

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        data = request.get_json()
        
        user = users.get({'_key': user_key})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        allowed_fields = ['username', 'email', 'primary_skill', 'secondary_skill', 'learning_goal']
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if update_data:
            users.update({'_key': user_key}, update_data)
        
        if 'primary_skill' in data and data['primary_skill']:
            skill_id = data['primary_skill'].replace(" ", "_").lower()
            
            try:
                if not skills.has(skill_id):
                    skills.insert({
                        '_key': skill_id,
                        'name': data['primary_skill'],
                        'category': 'Technical'
                    })
            except:
                pass
            
            aql_remove = """
            FOR edge IN has_skill
                FILTER edge._from == @user_doc
                REMOVE edge IN has_skill
            """
            db.aql.execute(aql_remove, bind_vars={'user_doc': f'users/{user_key}'})
            
            has_skill = graph.edge_collection('has_skill')
            has_skill.insert({
                '_from': f'users/{user_key}',
                '_to': f'skills/{skill_id}',
                'proficiency': 5
            })
        
        if 'learning_goal' in data and data['learning_goal']:
            skill_id = data['learning_goal'].replace(" ", "_").lower()
            
            try:
                if not skills.has(skill_id):
                    skills.insert({
                        '_key': skill_id,
                        'name': data['learning_goal'],
                        'category': 'Technical'
                    })
            except:
                pass
            
            aql_remove = """
            FOR edge IN wants_to_learn
                FILTER edge._from == @user_doc
                REMOVE edge IN wants_to_learn
            """
            db.aql.execute(aql_remove, bind_vars={'user_doc': f'users/{user_key}'})
            
            wants_to_learn = graph.edge_collection('wants_to_learn')
            wants_to_learn.insert({
                '_from': f'users/{user_key}',
                '_to': f'skills/{skill_id}'
            })
        
        return jsonify({"message": "Profile updated successfully"})
    
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return jsonify({"error": "Profile update failed"}), 500

@app.route('/add-skill', methods=['POST'])
@jwt_required()
def add_skill():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'skill_name' not in data or 'skill_type' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        skill_name = data['skill_name']
        skill_type = data['skill_type']
        skill_level = data.get('skill_level', 'Intermediate')
        
        skill_id = skill_name.replace(" ", "_").lower()
        
        try:
            if not skills.has(skill_id):
                skills.insert({
                    '_key': skill_id,
                    'name': skill_name,
                    'category': skill_level if skill_type == 'teaching' else 'Technical'
                })
            else:
                if skill_type == 'teaching':
                    skills.update({'_key': skill_id}, {'category': skill_level})
        except Exception as e:
            logger.error(f"Error creating skill document: {e}")
            return jsonify({"error": "Failed to create skill"}), 500
        
        try:
            if skill_type == 'teaching':
                has_skill = graph.edge_collection('has_skill')
                
                aql_check = """
                WITH users, skills, has_skill
                FOR edge IN has_skill
                    FILTER edge._from == @user_doc AND edge._to == @skill_doc
                    RETURN edge
                """
                
                cursor = db.aql.execute(
                    aql_check, 
                    bind_vars={
                        'user_doc': f'users/{user_key}',
                        'skill_doc': f'skills/{skill_id}'
                    }
                )
                
                edge_exists = next(cursor, None)
                
                if not edge_exists:
                    has_skill.insert({
                        '_from': f'users/{user_key}',
                        '_to': f'skills/{skill_id}',
                        'proficiency': 5
                    })
                
            elif skill_type == 'learning':
                wants_to_learn = graph.edge_collection('wants_to_learn')
                
                aql_check = """
                WITH users, skills, wants_to_learn
                FOR edge IN wants_to_learn
                    FILTER edge._from == @user_doc AND edge._to == @skill_doc
                    RETURN edge
                """
                
                cursor = db.aql.execute(
                    aql_check, 
                    bind_vars={
                        'user_doc': f'users/{user_key}',
                        'skill_doc': f'skills/{skill_id}'
                    }
                )
                
                edge_exists = next(cursor, None)
                
                if not edge_exists:
                    wants_to_learn.insert({
                        '_from': f'users/{user_key}',
                        '_to': f'skills/{skill_id}'
                    })
            
            else:
                return jsonify({"error": "Invalid skill type. Must be 'teaching' or 'learning'"}), 400
                
        except Exception as e:
            logger.error(f"Error creating relationship: {e}")
            return jsonify({"error": "Failed to associate skill with user"}), 500
            
        return jsonify({
            "message": f"Successfully added {skill_type} skill",
            "skill": {
                "id": skill_id,
                "name": skill_name,
                "level": skill_level if skill_type == 'teaching' else None
            }
        })
        
    except Exception as e:
        logger.error(f"Error adding skill: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to add skill. Please try again."}), 500

@app.route('/remove-skill', methods=['POST'])
@jwt_required()
def remove_skill():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'skill_id' not in data or 'skill_type' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        skill_id = data['skill_id']
        skill_type = data['skill_type']
        
        try:
            if skill_type == 'teaching':
                aql_remove = """
                WITH users, skills, has_skill
                FOR edge IN has_skill
                    FILTER edge._from == @user_doc AND edge._to == @skill_doc
                    REMOVE edge IN has_skill
                """
                db.aql.execute(
                    aql_remove, 
                    bind_vars={
                        'user_doc': f'users/{user_key}',
                        'skill_doc': f'skills/{skill_id}'
                    }
                )
                
            elif skill_type == 'learning':
                aql_remove = """
                WITH users, skills, wants_to_learn
                FOR edge IN wants_to_learn
                    FILTER edge._from == @user_doc AND edge._to == @skill_doc
                    REMOVE edge IN wants_to_learn
                """
                db.aql.execute(
                    aql_remove, 
                    bind_vars={
                        'user_doc': f'users/{user_key}',
                        'skill_doc': f'skills/{skill_id}'
                    }
                )
            
            else:
                return jsonify({"error": "Invalid skill type. Must be 'teaching' or 'learning'"}), 400
                
        except Exception as e:
            logger.error(f"Error removing relationship: {e}")
            return jsonify({"error": "Failed to remove skill from user"}), 500
            
        return jsonify({
            "message": f"Successfully removed {skill_type} skill",
            "skill_id": skill_id
        })
        
    except Exception as e:
        logger.error(f"Error removing skill: {e}")
        return jsonify({"error": "Failed to remove skill. Please try again."}), 500

@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        
        logger.info(f"Finding matches for user: {user_key}")
        
        aql = """
        WITH users, skills, has_skill, wants_to_learn
        FOR user IN users
            FILTER user._key == @user_key
            LET my_skills = (
                FOR skill IN OUTBOUND CONCAT('users/', @user_key) has_skill
                    RETURN skill._id
            )
            LET my_goals = (
                FOR goal IN OUTBOUND CONCAT('users/', @user_key) wants_to_learn
                    RETURN goal._id
            )
            FOR other IN users
                FILTER other._key != @user_key
                LET other_skills = (
                    FOR skill IN OUTBOUND CONCAT('users/', other._key) has_skill
                        RETURN skill._id
                )
                LET other_goals = (
                    FOR goal IN OUTBOUND CONCAT('users/', other._key) wants_to_learn
                        RETURN goal._id
                )
                LET skill_match = LENGTH(INTERSECTION(my_skills, other_goals))
                LET goal_match = LENGTH(INTERSECTION(my_goals, other_skills))
                LET match_score = skill_match + goal_match
                
                SORT match_score DESC
                LIMIT 5
                RETURN {
                    user_id: other._key,
                    username: other.username,
                    match_score: match_score,
                    matching_skills: INTERSECTION(my_goals, other_skills),
                    matching_goals: INTERSECTION(my_skills, other_goals),
                    all_skills: other_skills,
                    all_goals: other_goals,
                    match_percentage: CEIL(match_score * 20)
                }
        """
        
        cursor = db.aql.execute(aql, bind_vars={'user_key': user_key})
        matches = [doc for doc in cursor]
        
        logger.info(f"Found {len(matches)} matches for user {user_key}")
        return jsonify({"matches": matches})

    except Exception as e:
        logger.error(f"Error predicting matches: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to find matches. Please try again."}), 500

@app.route('/swipe', methods=['POST', 'OPTIONS'])
@jwt_required()
def record_swipe():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'target_user_id' not in data or 'liked' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        target_user_id = data['target_user_id']
        liked = data['liked']
        
        # Record this user's swipe decision
        match_record = {
            'user_id': user_key,
            'target_user_id': target_user_id,
            'liked': liked,
            'created_at': datetime.now().isoformat()
        }
        
        matches.insert(match_record)
        
        # Check if it's a mutual match
        is_mutual_match = False
        match_details = None
        
        if liked:
            # Check if the other user also liked this user
            query = {
                'user_id': target_user_id,
                'target_user_id': user_key,
                'liked': True
            }
            cursor = matches.find(query)
            other_match = next(cursor, None)
            
            if other_match:
                is_mutual_match = True
                
                # Get information about the match for the frontend
                user_doc = users.get({'_key': target_user_id})
                if user_doc:
                    match_details = {
                        'user_id': target_user_id,
                        'username': user_doc.get('username')
                    }
        
        return jsonify({
            "success": True,
            "is_match": is_mutual_match,
            "match_details": match_details
        })
        
    except Exception as e:
        logger.error(f"Error recording swipe: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to record choice. Please try again."}), 500

@app.route('/matches', methods=['GET'])
@jwt_required()
def get_matches():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        
        # Find all mutual matches (where both users liked each other)
        aql = """
        WITH matches, users
        LET mutual_matches = (
            FOR m1 IN matches
                FILTER m1.user_id == @user_key AND m1.liked == true
                FOR m2 IN matches
                    FILTER m2.user_id == m1.target_user_id 
                      AND m2.target_user_id == @user_key 
                      AND m2.liked == true
                    RETURN m2.user_id
        )
        
        LET result = (
            FOR user_id IN mutual_matches
                LET user = DOCUMENT(CONCAT('users/', user_id))
                
                // Count messages between these users
                LET message_count = LENGTH(
                    FOR msg IN messages
                        FILTER (msg.sender_id == @user_key AND msg.receiver_id == user_id) OR
                               (msg.sender_id == user_id AND msg.receiver_id == @user_key)
                        RETURN msg
                )
                
                // Count unread messages
                LET unread_count = LENGTH(
                    FOR msg IN messages
                        FILTER msg.sender_id == user_id AND 
                              msg.receiver_id == @user_key AND
                              msg.is_read == false
                        RETURN msg
                )
                
                // Get the most recent message
                LET last_message = FIRST(
                    FOR msg IN messages
                        FILTER (msg.sender_id == @user_key AND msg.receiver_id == user_id) OR
                               (msg.sender_id == user_id AND msg.receiver_id == @user_key)
                        SORT msg.created_at DESC
                        LIMIT 1
                        RETURN msg.text
                )
                
                RETURN {
                    id: user_id,
                    username: user.username,
                    last_message: last_message,
                    message_count: message_count,
                    unread_count: unread_count,
                    max_messages: 5  // Message limit for MVP
                }
        )
        
        RETURN result
        """
        
        cursor = db.aql.execute(aql, bind_vars={'user_key': user_key})
        matches_list = next(cursor, [])
        
        return jsonify({"matches": matches_list})
        
    except Exception as e:
        logger.error(f"Error fetching matches: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to load matches. Please try again."}), 500

@app.route('/messages/<match_id>', methods=['GET'])
@jwt_required()
def get_messages(match_id):
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        
        # Verify this is a valid match (both users liked each other)
        aql_check = """
        WITH matches
        RETURN LENGTH(
            FOR m1 IN matches
                FILTER m1.user_id == @user_key AND m1.target_user_id == @match_id AND m1.liked == true
                FOR m2 IN matches
                    FILTER m2.user_id == @match_id AND m2.target_user_id == @user_key AND m2.liked == true
                    RETURN 1
        ) > 0
        """
        
        cursor = db.aql.execute(aql_check, bind_vars={'user_key': user_key, 'match_id': match_id})
        is_valid_match = next(cursor)
        
        if not is_valid_match:
            return jsonify({"error": "Invalid match or unauthorized access"}), 403
        
        # Get messages
        aql = """
        WITH messages
        LET msg_list = (
            FOR msg IN messages
                FILTER (msg.sender_id == @user_key AND msg.receiver_id == @match_id) OR
                       (msg.sender_id == @match_id AND msg.receiver_id == @user_key)
                SORT msg.created_at ASC
                RETURN {
                    id: msg._key,
                    senderId: msg.sender_id,
                    text: msg.text,
                    timestamp: msg.created_at,
                    isRead: msg.is_read
                }
        )
        
        // Mark messages as read
        FOR msg IN messages
            FILTER msg.sender_id == @match_id AND msg.receiver_id == @user_key AND msg.is_read == false
            UPDATE msg WITH { is_read: true } IN messages
            
        RETURN msg_list
        """
        
        cursor = db.aql.execute(aql, bind_vars={'user_key': user_key, 'match_id': match_id})
        messages_list = next(cursor, [])
        
        return jsonify({"messages": messages_list})
        
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to load messages. Please try again."}), 500

@app.route('/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'recipientId' not in data or 'text' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        recipient_id = data['recipientId']
        text = data['text']
        
        # Verify this is a valid match (both users liked each other)
        aql_check = """
        WITH matches
        RETURN LENGTH(
            FOR m1 IN matches
                FILTER m1.user_id == @user_key AND m1.target_user_id == @recipient_id AND m1.liked == true
                FOR m2 IN matches
                    FILTER m2.user_id == @recipient_id AND m2.target_user_id == @user_key AND m2.liked == true
                    RETURN 1
        ) > 0
        """
        
        cursor = db.aql.execute(aql_check, bind_vars={'user_key': user_key, 'recipient_id': recipient_id})
        is_valid_match = next(cursor)
        
        if not is_valid_match:
            return jsonify({"error": "You can only message users you've matched with"}), 403
        
        # Check message limit (5 messages max)
        aql_count = """
        WITH messages
        RETURN LENGTH(
            FOR msg IN messages
                FILTER (msg.sender_id == @user_key AND msg.receiver_id == @recipient_id) OR
                       (msg.sender_id == @recipient_id AND msg.receiver_id == @user_key)
                RETURN 1
        )
        """
        
        cursor = db.aql.execute(aql_count, bind_vars={'user_key': user_key, 'recipient_id': recipient_id})
        message_count = next(cursor)
        
        if message_count >= 5:
            return jsonify({"error": "Message limit reached for this match"}), 403
        
        # Create message
        message = {
            'sender_id': user_key,
            'receiver_id': recipient_id,
            'text': text,
            'is_read': False,
            'created_at': datetime.now().isoformat()
        }
        
        meta = messages.insert(message)
        message_id = meta['_key']
        
        # Return the new message
        message_response = {
            'id': message_id,
            'senderId': user_key,
            'text': text,
            'timestamp': message['created_at'],
            'isRead': False
        }
        
        return jsonify({"message": message_response})
        
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to send message. Please try again."}), 500

@app.route('/pending-matches', methods=['POST'])
@jwt_required()
def get_pending_matches():
    try:
        if not db_connected:
            return jsonify({"error": "Database connection not available"}), 503
            
        user_key = get_jwt_identity()
        
        # Find users who liked the current user, but current user hasn't liked them back yet
        aql = """
        WITH matches, users
        LET users_who_liked_me = (
            FOR m IN matches
                FILTER m.target_user_id == @user_key AND m.liked == true
                RETURN m.user_id
        )
        
        LET users_i_liked = (
            FOR m IN matches
                FILTER m.user_id == @user_key AND m.liked == true
                RETURN m.target_user_id
        )
        
        // Find users who liked me but I haven't liked back
        LET pending_user_ids = MINUS(users_who_liked_me, users_i_liked)
        
        // Get user info and match percentage for each pending match
        LET pending_matches = (
            FOR pending_id IN pending_user_ids
                // Calculate match score for frontend display
                LET pending_user = DOCUMENT(CONCAT('users/', pending_id))
                
                // Get the user's skills and goals
                LET my_skills = (
                    FOR skill IN OUTBOUND CONCAT('users/', @user_key) has_skill
                        RETURN skill._id
                )
                LET my_goals = (
                    FOR goal IN OUTBOUND CONCAT('users/', @user_key) wants_to_learn
                        RETURN goal._id
                )
                LET other_skills = (
                    FOR skill IN OUTBOUND CONCAT('users/', pending_id) has_skill
                        RETURN skill._id
                )
                LET other_goals = (
                    FOR goal IN OUTBOUND CONCAT('users/', pending_id) wants_to_learn
                        RETURN goal._id
                )
                
                // Calculate match score
                LET skill_match = LENGTH(INTERSECTION(my_skills, other_goals))
                LET goal_match = LENGTH(INTERSECTION(my_goals, other_skills))
                LET match_score = skill_match + goal_match
                
                RETURN {
                    user_id: pending_id,
                    username: pending_user.username,
                    match_percentage: CEIL(match_score * 20)
                }
        )
        
        RETURN pending_matches
        """
        
        cursor = db.aql.execute(aql, bind_vars={'user_key': user_key})
        pending_matches = next(cursor, [])
        
        return jsonify({"pending_matches": pending_matches})
        
    except Exception as e:
        logger.error(f"Error fetching pending matches: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to load pending matches. Please try again."}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "database": "connected" if db_connected else "disconnected"
    })

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8088))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    app.run(host="0.0.0.0", port=port, debug=debug)
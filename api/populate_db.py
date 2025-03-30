import os
import logging
from arango import ArangoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get ArangoDB credentials
ARANGO_URL = os.getenv("ARANGO_URL")
ARANGO_DB_NAME = os.getenv("ARANGO_DB_NAME")
ARANGO_USERNAME = os.getenv("ARANGO_USERNAME")
ARANGO_PASSWORD = os.getenv("ARANGO_PASSWORD")

# Initialize the ArangoDB client
client = ArangoClient(hosts=ARANGO_URL)
db = client.db(ARANGO_DB_NAME, username=ARANGO_USERNAME, password=ARANGO_PASSWORD)

# Get collections
users = db.collection('users')
skills = db.collection('skills')
graph = db.graph('skill_graph')
has_skill = graph.edge_collection('has_skill')
wants_to_learn = graph.edge_collection('wants_to_learn')

# Check if we should clear existing data
clear_data = input("Clear existing data? (y/n): ").lower() == 'y'

if clear_data:
    logger.info("Clearing existing data...")
    has_skill.truncate()
    wants_to_learn.truncate()
    users.truncate()
    skills.truncate()
    logger.info("Data cleared successfully")

# Define skill categories and levels
SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

# Define skills by category
SKILLS = {
    'Programming': [
        'Python', 'JavaScript', 'Java', 'C++', 'Ruby', 'Go', 'TypeScript', 
        'PHP', 'Swift', 'Kotlin', 'Rust', 'HTML', 'CSS', 'SQL', 'NoSQL'
    ],
    'Data Science': [
        'Machine Learning', 'Deep Learning', 'Natural Language Processing',
        'Computer Vision', 'Data Analysis', 'Data Visualization', 'Statistics',
        'TensorFlow', 'PyTorch', 'Pandas', 'Numpy', 'R'
    ],
    'Web Dev': [
        'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask',
        'Express.js', 'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL',
        'Firebase', 'AWS', 'Docker', 'Kubernetes'
    ],
    'Design': [
        'UI Design', 'UX Design', 'Graphic Design', 'Figma', 'Adobe XD',
        'Photoshop', 'Illustrator', 'Sketch', 'InDesign', 'Typography',
        'Color Theory', 'Motion Design'
    ],
    'Business': [
        'Project Management', 'Agile', 'Scrum', 'Marketing', 'Finance',
        'Accounting', 'Sales', 'Supply Chain', 'HR Management', 'Leadership',
        'Public Speaking', 'Negotiation'
    ],
    'Soft Skills': [
        'Communication', 'Teamwork', 'Time Management', 'Problem Solving',
        'Critical Thinking', 'Creativity', 'Adaptability', 'Emotional Intelligence',
        'Conflict Resolution', 'Stress Management'
    ]
}

# Flatten skills to a list
all_skills = []
for category, skills_list in SKILLS.items():
    for skill_name in skills_list:
        all_skills.append((skill_name, category))

logger.info(f"Adding {len(all_skills)} skills...")

# Add skills
skill_docs = {}
for skill_name, category in all_skills:
    skill_id = skill_name.replace(" ", "_").lower()
    if not skills.has(skill_id):
        doc = {
            '_key': skill_id,
            'name': skill_name,
            'category': category
        }
        skills.insert(doc)
        skill_docs[skill_name] = skill_id
        logger.info(f"Added skill: {skill_name} ({category})")
    else:
        logger.info(f"Skill already exists: {skill_name}")
        skill_docs[skill_name] = skill_id

# Define users with their teaching and learning skills
USERS = [
    {
        'username': 'alex_dev',
        'email': 'alex@example.com',
        'password': 'password123',
        'bio': 'Full-stack developer with 5 years of experience',
        'teaching_skills': ['JavaScript', 'React', 'Node.js', 'CSS', 'HTML'],
        'learning_skills': ['Machine Learning', 'Python', 'Data Analysis', 'AWS']
    },
    {
        'username': 'sarah_data',
        'email': 'sarah@example.com',
        'password': 'password123',
        'bio': 'Data scientist passionate about ML and NLP',
        'teaching_skills': ['Python', 'Machine Learning', 'Data Analysis', 'Statistics', 'TensorFlow'],
        'learning_skills': ['JavaScript', 'React', 'UI Design', 'Communication']
    },
    {
        'username': 'mike_design',
        'email': 'mike@example.com',
        'password': 'password123',
        'bio': 'UX/UI designer with a focus on mobile apps',
        'teaching_skills': ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Sketch'],
        'learning_skills': ['JavaScript', 'React Native', 'Swift', 'Typography']
    },
    {
        'username': 'lisa_pm',
        'email': 'lisa@example.com',
        'password': 'password123',
        'bio': 'Product manager with technical background',
        'teaching_skills': ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication'],
        'learning_skills': ['Python', 'Data Analysis', 'UI Design', 'SQL']
    },
    {
        'username': 'david_mobile',
        'email': 'david@example.com',
        'password': 'password123',
        'bio': 'Mobile developer specializing in iOS',
        'teaching_skills': ['Swift', 'iOS Development', 'UI Design', 'REST API'],
        'learning_skills': ['Kotlin', 'Android Development', 'Flutter', 'Firebase']
    },
    {
        'username': 'emma_backend',
        'email': 'emma@example.com',
        'password': 'password123',
        'bio': 'Backend engineer with focus on scalable systems',
        'teaching_skills': ['Java', 'Python', 'SQL', 'Docker', 'AWS'],
        'learning_skills': ['Go', 'Kubernetes', 'GraphQL', 'React']
    },
    {
        'username': 'jason_ml',
        'email': 'jason@example.com',
        'password': 'password123',
        'bio': 'Machine learning researcher working on computer vision',
        'teaching_skills': ['Computer Vision', 'Deep Learning', 'PyTorch', 'Python'],
        'learning_skills': ['JavaScript', 'React', 'Data Visualization', 'Cloud Computing']
    },
    {
        'username': 'rachel_frontend',
        'email': 'rachel@example.com',
        'password': 'password123',
        'bio': 'Frontend developer with an eye for design',
        'teaching_skills': ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript'],
        'learning_skills': ['Node.js', 'Python', 'UX Design', 'Project Management']
    },
    {
        'username': 'tom_devops',
        'email': 'tom@example.com',
        'password': 'password123',
        'bio': 'DevOps engineer with cloud expertise',
        'teaching_skills': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
        'learning_skills': ['Go', 'Python', 'Machine Learning', 'Security']
    },
    {
        'username': 'nina_ux',
        'email': 'nina@example.com',
        'password': 'password123',
        'bio': 'UX researcher with cognitive psychology background',
        'teaching_skills': ['UX Design', 'User Research', 'Usability Testing', 'Prototyping'],
        'learning_skills': ['HTML', 'CSS', 'JavaScript', 'Data Visualization']
    }
]

logger.info(f"Adding {len(USERS)} users with their skills...")

# Add users and their relationships
for user_data in USERS:
    # Skip if user already exists
    existing = users.find({'username': user_data['username']})
    if next(existing, None):
        logger.info(f"User already exists: {user_data['username']}")
        continue
    
    # Create user
    user = {
        'username': user_data['username'],
        'email': user_data['email'],
        'password': generate_password_hash(user_data['password']),
        'bio': user_data['bio']
    }
    
    meta = users.insert(user)
    user_key = meta['_key']
    logger.info(f"Added user: {user_data['username']} with key {user_key}")
    
    # Add teaching skills
    for skill_name in user_data['teaching_skills']:
        if skill_name in skill_docs:
            skill_id = skill_docs[skill_name]
            level = random.choice(SKILL_LEVELS)
            
            # Check if the relationship already exists
            existing_edge = has_skill.find({
                '_from': f'users/{user_key}',
                '_to': f'skills/{skill_id}'
            })
            
            if not next(existing_edge, None):
                has_skill.insert({
                    '_from': f'users/{user_key}',
                    '_to': f'skills/{skill_id}',
                    'proficiency': random.randint(3, 5)
                })
                logger.info(f"  Added teaching skill: {skill_name} ({level})")
    
    # Add learning skills
    for skill_name in user_data['learning_skills']:
        if skill_name in skill_docs:
            skill_id = skill_docs[skill_name]
            
            # Check if the relationship already exists
            existing_edge = wants_to_learn.find({
                '_from': f'users/{user_key}',
                '_to': f'skills/{skill_id}'
            })
            
            if not next(existing_edge, None):
                wants_to_learn.insert({
                    '_from': f'users/{user_key}',
                    '_to': f'skills/{skill_id}'
                })
                logger.info(f"  Added learning skill: {skill_name}")

logger.info("Data population complete!")

# Print summary
users_count = len(list(users.all()))
skills_count = len(list(skills.all()))
teaching_count = len(list(has_skill.all()))
learning_count = len(list(wants_to_learn.all()))

print("\n=== Database Population Summary ===")
print(f"Users: {users_count}")
print(f"Skills: {skills_count}")
print(f"Teaching relationships: {teaching_count}")
print(f"Learning relationships: {learning_count}")
print("\nYou can now log in with any of these accounts:")
for user in USERS:
    print(f"- Username: {user['username']}, Password: {user['password']}")
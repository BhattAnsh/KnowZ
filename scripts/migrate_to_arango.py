import os
import sys
import logging
import networkx as nx
from arango import ArangoClient
from dotenv import load_dotenv
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("migration.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv("../api/.env")

def main():
    try:
        # Get database credentials from environment variables
        arango_url = os.getenv("ARANGO_URL")
        arango_db = os.getenv("ARANGO_DB_NAME")
        arango_user = os.getenv("ARANGO_USERNAME")
        arango_pass = os.getenv("ARANGO_PASSWORD")
        
        if not all([arango_url, arango_db, arango_user, arango_pass]):
            logger.error("Missing required environment variables. Please check your .env file.")
            return
            
        # Connect to ArangoDB
        logger.info(f"Connecting to ArangoDB at {arango_url}")
        client = ArangoClient(hosts=arango_url)
        db = client.db(arango_db, username=arango_user, password=arango_pass)
        
        # Load the existing graph
        graph_path = os.getenv("GRAPH_PATH", "/Users/anshbhatt/Downloads/7331/data/knowledge_graph.graphml")
        logger.info(f"Loading graph from {graph_path}")
        G = nx.read_graphml(graph_path)
        logger.info(f"Loaded graph with {len(G.nodes)} nodes and {len(G.edges)} edges")
        
        # Set up collections
        if not db.has_graph('skill_graph'):
            logger.info("Creating skill_graph and collections")
            graph = db.create_graph('skill_graph')
            graph.create_vertex_collection('users')
            graph.create_vertex_collection('skills')
            graph.create_edge_definition(
                edge_collection='has_skill',
                from_vertex_collections=['users'],
                to_vertex_collections=['skills']
            )
            graph.create_edge_definition(
                edge_collection='wants_to_learn',
                from_vertex_collections=['users'],
                to_vertex_collections=['skills']
            )
            graph.create_edge_definition(
                edge_collection='user_similarity',
                from_vertex_collections=['users'],
                to_vertex_collections=['users']
            )
        else:
            logger.info("Using existing skill_graph")
            graph = db.graph('skill_graph')
        
        # Get collections
        users = db.collection('users')
        skills = db.collection('skills')
        has_skill = graph.edge_collection('has_skill')
        wants_to_learn = graph.edge_collection('wants_to_learn')
        user_similarity = graph.edge_collection('user_similarity')
        
        # Migrate nodes with progress bar
        logger.info("Migrating nodes")
        user_count = 0
        skill_count = 0
        
        for node, attrs in tqdm(list(G.nodes(data=True)), desc="Migrating nodes"):
            try:
                if node.startswith('user_'):
                    # Insert user
                    user_doc = {'_key': node, **attrs}
                    try:
                        users.insert(user_doc, overwrite=False)
                        user_count += 1
                    except Exception as e:
                        if "unique constraint violated" not in str(e).lower():
                            logger.warning(f"Error inserting user {node}: {e}")
                
                elif node.startswith('skill_'):
                    # Insert skill
                    skill_doc = {'_key': node, **attrs}
                    try:
                        skills.insert(skill_doc, overwrite=False)
                        skill_count += 1
                    except Exception as e:
                        if "unique constraint violated" not in str(e).lower():
                            logger.warning(f"Error inserting skill {node}: {e}")
            except Exception as e:
                logger.error(f"Error processing node {node}: {e}")
        
        logger.info(f"Migrated {user_count} users and {skill_count} skills")
        
        # Migrate edges with progress bar
        logger.info("Migrating edges")
        has_skill_count = 0
        wants_to_learn_count = 0
        user_similarity_count = 0
        
        for u, v, attrs in tqdm(list(G.edges(data=True)), desc="Migrating edges"):
            try:
                if u.startswith('user_') and v.startswith('skill_'):
                    if attrs.get('edge_type') == 'has':
                        try:
                            has_skill.insert({
                                '_from': f'users/{u}',
                                '_to': f'skills/{v}',
                                **attrs
                            }, overwrite=False)
                            has_skill_count += 1
                        except Exception as e:
                            if "unique constraint violated" not in str(e).lower():
                                logger.warning(f"Error inserting has_skill edge {u}->{v}: {e}")
                    
                    elif attrs.get('edge_type') == 'wants':
                        try:
                            wants_to_learn.insert({
                                '_from': f'users/{u}',
                                '_to': f'skills/{v}',
                                **attrs
                            }, overwrite=False)
                            wants_to_learn_count += 1
                        except Exception as e:
                            if "unique constraint violated" not in str(e).lower():
                                logger.warning(f"Error inserting wants_to_learn edge {u}->{v}: {e}")
                
                elif u.startswith('user_') and v.startswith('user_'):
                    try:
                        user_similarity.insert({
                            '_from': f'users/{u}',
                            '_to': f'users/{v}',
                            **attrs
                        }, overwrite=False)
                        user_similarity_count += 1
                    except Exception as e:
                        if "unique constraint violated" not in str(e).lower():
                            logger.warning(f"Error inserting user_similarity edge {u}->{v}: {e}")
            except Exception as e:
                logger.error(f"Error processing edge {u}->{v}: {e}")
        
        logger.info(f"Migrated {has_skill_count} has_skill edges, {wants_to_learn_count} wants_to_learn edges, and {user_similarity_count} user_similarity edges")
        logger.info("Migration complete!")

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise

if __name__ == "__main__":
    main()
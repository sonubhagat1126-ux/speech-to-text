import hashlib
import secrets
import hmac
import logging
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

logger = logging.getLogger(__name__)

# --- Cryptographic Password Hashing (PBKDF2) ---

def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique salt.
    Matches standard secure hashing layouts: pbkdf2:sha256:iterations$salt$hash
    """
    iterations = 100000
    salt = secrets.token_hex(16)
    
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, iterations)
    hash_hex = key.hex()
    
    return f"pbkdf2:sha256:{iterations}${salt}${hash_hex}"

def verify_password(password: str, stored_hash: str) -> bool:
    """
    Secures password matching using hmac.compare_digest to defend against timing attacks.
    """
    try:
        if not stored_hash or '$' not in stored_hash:
            return False
            
        parts = stored_hash.split('$')
        if len(parts) != 3:
            return False
            
        header, salt, hash_hex = parts
        iterations = int(header.split(':')[-1])
        
        pwd_bytes = password.encode('utf-8')
        salt_bytes = salt.encode('utf-8')
        target_bytes = bytes.fromhex(hash_hex)
        
        computed_key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, iterations)
        
        return hmac.compare_digest(computed_key, target_bytes)
    except Exception as e:
        logger.error(f"Error during password verification: {e}")
        return False

# --- Secure Session Token Handling (itsdangerous) ---

def generate_auth_token(user_id: int, secret_key: str) -> str:
    """Generates a secure, signed token containing the user_id (expires in 24h)."""
    serializer = URLSafeTimedSerializer(secret_key)
    return serializer.dumps({'user_id': user_id})

def verify_auth_token(token: str, secret_key: str) -> int:
    """
    Verifies the signed token and extracts the user_id.
    Returns the user_id if valid, or None if expired/corrupted.
    """
    serializer = URLSafeTimedSerializer(secret_key)
    try:
        # Token valid for 24 hours (86400 seconds)
        data = serializer.loads(token, max_age=86400)
        return data.get('user_id')
    except SignatureExpired:
        logger.warning("Token verification failed: token has expired.")
        return None
    except BadSignature:
        logger.warning("Token verification failed: invalid signature.")
        return None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None

"""Centralized Redis client configuration."""
import redis
from app.core.config import settings
from app.core.logging import logger


def create_redis_client() -> redis.Redis:
    """
    Create Redis client from REDIS_URL environment variable.
    
    Returns:
        redis.Redis: Configured Redis client with decode_responses=True
    
    Raises:
        redis.ConnectionError: If unable to connect to Redis
    
    Examples:
        >>> from app.core.redis import redis_client
        >>> redis_client.ping()
        True
    """
    try:
        client = redis.Redis.from_url(
            settings.redis_url,
            decode_responses=True
        )
        logger.info(f"Redis client created from URL: {settings.redis_url}")
        return client
    except Exception as e:
        logger.error(f"Failed to create Redis client: {e}")
        raise


# Global Redis client instance
redis_client = create_redis_client()

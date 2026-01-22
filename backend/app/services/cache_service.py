"""
Service layer for cache management with Redis.

Handles caching operations with TTL and invalidation strategies.
Provides graceful degradation when cache operations fail.
"""
from typing import Optional, Any
from datetime import timedelta
import json
from app.core.logging import logger


class CacheService:
    """
    Service for managing Redis cache operations with TTL and invalidation.
    
    This service provides a caching layer to reduce database load by storing
    frequently accessed data with appropriate TTL values. It includes:
    - Graceful degradation on cache failures
    - Standardized cache key building
    - Entity-specific TTL configuration
    
    Validates: Requirements 4.7
    """
    
    def __init__(self, redis_client):
        """
        Initialize cache service with Redis client.
        
        Args:
            redis_client: Redis client instance (from app.core.redis)
        
        Raises:
            ValueError: If redis_client is None
        
        Examples:
            >>> from app.core.redis import redis_client
            >>> cache_service = CacheService(redis_client)
        """
        if redis_client is None:
            raise ValueError("redis_client cannot be None")
        
        self.redis = redis_client
        
        # Default TTL values for different entity types
        # Based on Requirements 4.8: user: 15 min, business/config: 30 min, theme: 1 hour
        self.default_ttl = {
            'user': timedelta(minutes=15),
            'business': timedelta(minutes=30),
            'config': timedelta(minutes=30),
            'theme': timedelta(hours=1)
        }
        
        logger.info("CacheService initialized with provided Redis client")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve cached data by key.
        
        Returns None if key doesn't exist, TTL expired, or operation fails.
        Failures are logged but don't raise exceptions (graceful degradation).
        
        Args:
            key: Cache key to retrieve
        
        Returns:
            Cached data (deserialized from JSON) or None
        
        Examples:
            >>> cache_service.get('user:123')
            {'id': '123', 'email': 'user@example.com', 'onboarding_completed': True}
            >>> cache_service.get('nonexistent:key')
            None
        
        Validates: Requirements 4.5
        """
        try:
            value = self.redis.get(key)
            
            if value is None:
                logger.debug(f"Cache miss: {key}")
                return None
            
            logger.debug(f"Cache hit: {key}")
            # Deserialize JSON data
            return json.loads(value)
        
        except Exception as e:
            logger.warning(f"Cache get operation failed for key '{key}': {str(e)}")
            return None  # Graceful degradation
    
    def set(self, key: str, value: Any, ttl: Optional[timedelta] = None) -> bool:
        """
        Store data in cache with optional TTL.
        
        Data is serialized to JSON before storage.
        Failures are logged but don't raise exceptions (graceful degradation).
        
        Args:
            key: Cache key to store
            value: Data to cache (must be JSON-serializable)
            ttl: Time to live (optional, uses default if not provided)
        
        Returns:
            True if successful, False otherwise
        
        Examples:
            >>> user_data = {'id': '123', 'email': 'user@example.com'}
            >>> cache_service.set('user:123', user_data, timedelta(minutes=15))
            True
        
        Validates: Requirements 4.1, 4.8
        """
        try:
            # Serialize data to JSON
            serialized_value = json.dumps(value)
            
            if ttl is not None:
                # Set with specific TTL
                self.redis.setex(
                    key,
                    int(ttl.total_seconds()),
                    serialized_value
                )
            else:
                # Set without expiration
                self.redis.set(key, serialized_value)
            
            logger.debug(f"Cache set: {key} (TTL: {ttl})")
            return True
        
        except Exception as e:
            logger.warning(f"Cache set operation failed for key '{key}': {str(e)}")
            return False  # Graceful degradation
    
    def invalidate(self, key: str) -> bool:
        """
        Remove cached data by key.
        
        Failures are logged but don't raise exceptions (graceful degradation).
        
        Args:
            key: Cache key to remove
        
        Returns:
            True if successful, False otherwise
        
        Examples:
            >>> cache_service.invalidate('user:123')
            True
        
        Validates: Requirements 5.5
        """
        try:
            deleted_count = self.redis.delete(key)
            
            if deleted_count > 0:
                logger.debug(f"Cache invalidated: {key}")
            else:
                logger.debug(f"Cache invalidation: key not found: {key}")
            
            return True
        
        except Exception as e:
            logger.warning(f"Cache invalidate operation failed for key '{key}': {str(e)}")
            return False  # Graceful degradation
    
    def invalidate_pattern(self, pattern: str) -> int:
        """
        Remove all cached data matching pattern.
        
        Uses Redis SCAN to find matching keys, then deletes them.
        Failures are logged but don't raise exceptions (graceful degradation).
        
        Args:
            pattern: Redis key pattern (e.g., 'user:*', 'business:123:*')
        
        Returns:
            Count of invalidated keys (0 if operation fails)
        
        Examples:
            >>> # Invalidate all user caches
            >>> cache_service.invalidate_pattern('user:*')
            5
            >>> # Invalidate all caches for a specific business
            >>> cache_service.invalidate_pattern('business:123:*')
            3
        
        Validates: Requirements 5.1, 5.2, 5.3
        """
        try:
            # Use SCAN to find matching keys (more efficient than KEYS)
            cursor = 0
            keys_to_delete = []
            
            while True:
                cursor, keys = self.redis.scan(cursor, match=pattern, count=100)
                keys_to_delete.extend(keys)
                
                if cursor == 0:
                    break
            
            if keys_to_delete:
                deleted_count = self.redis.delete(*keys_to_delete)
                logger.debug(f"Cache pattern invalidated: {pattern} ({deleted_count} keys)")
                return deleted_count
            else:
                logger.debug(f"Cache pattern invalidation: no keys found: {pattern}")
                return 0
        
        except Exception as e:
            logger.warning(
                f"Cache invalidate_pattern operation failed for pattern '{pattern}': {str(e)}"
            )
            return 0  # Graceful degradation
    
    def build_key(self, entity_type: str, entity_id: str, suffix: str = "") -> str:
        """
        Build standardized cache key.
        
        Format: {entity_type}:{entity_id} or {entity_type}:{entity_id}:{suffix}
        
        Args:
            entity_type: Type of entity (e.g., 'user', 'business', 'config', 'theme')
            entity_id: Unique identifier for the entity
            suffix: Optional suffix for sub-resources (e.g., 'business', 'config')
        
        Returns:
            Standardized cache key string
        
        Examples:
            >>> cache_service.build_key('user', '123')
            'user:123'
            >>> cache_service.build_key('user', '123', 'business')
            'user:123:business'
            >>> cache_service.build_key('business', '456', 'config')
            'business:456:config'
        
        Validates: Requirements 4.1
        """
        if suffix:
            return f"{entity_type}:{entity_id}:{suffix}"
        return f"{entity_type}:{entity_id}"

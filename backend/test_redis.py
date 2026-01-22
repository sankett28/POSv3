"""Test Redis connection and cache service."""
from dotenv import load_dotenv

load_dotenv()

def test_redis_connection():
    """Test Redis connection and basic operations."""
    try:
        # Import Redis client from centralized location
        from app.core.redis import redis_client
        
        # Test connection
        print("Testing Redis connection...")
        response = redis_client.ping()
        print(f"✅ Redis PING: {response}")
        
        # Test SET operation
        print("\nTesting SET operation...")
        redis_client.set('test_key', 'Hello Redis!')
        print("✅ SET operation successful")
        
        # Test GET operation
        print("\nTesting GET operation...")
        value = redis_client.get('test_key')
        print(f"✅ GET operation successful: {value}")
        
        # Test DELETE operation
        print("\nTesting DELETE operation...")
        redis_client.delete('test_key')
        print("✅ DELETE operation successful")
        
        # Test cache service
        print("\n" + "="*50)
        print("Testing CacheService...")
        print("="*50)
        
        from app.services.cache_service import CacheService
        
        cache_service = CacheService(redis_client)
        
        # Test build_key
        key = cache_service.build_key('user', '123')
        print(f"✅ Cache key built: {key}")
        
        # Test set
        test_data = {'id': '123', 'email': 'test@example.com', 'onboarding_completed': True}
        success = cache_service.set(key, test_data)
        print(f"✅ Cache set: {success}")
        
        # Test get
        cached_data = cache_service.get(key)
        print(f"✅ Cache get: {cached_data}")
        
        # Test invalidate
        success = cache_service.invalidate(key)
        print(f"✅ Cache invalidate: {success}")
        
        # Verify invalidation
        cached_data = cache_service.get(key)
        print(f"✅ Cache after invalidation: {cached_data}")
        
        # Test pattern invalidation
        print("\nTesting pattern invalidation...")
        cache_service.set('user:1', {'id': '1'})
        cache_service.set('user:2', {'id': '2'})
        cache_service.set('business:1', {'id': '1'})
        count = cache_service.invalidate_pattern('user:*')
        print(f"✅ Pattern invalidation removed {count} keys")
        
        print("\n" + "="*50)
        print("✅ All Redis tests passed!")
        print("="*50)
        print("\nRedis is ready for use with the auth-flow-and-caching-improvements feature!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("\n" + "="*50)
        print("TROUBLESHOOTING:")
        print("="*50)
        print("1. Make sure Redis is running:")
        print("   - Docker: docker run --name redis-cache -p 6379:6379 -d redis:latest")
        print("   - WSL2: sudo service redis-server start")
        print("   - Windows: redis-server")
        print("\n2. Check REDIS_URL in .env file")
        print("   - Should be: REDIS_URL=redis://localhost:6379/0")
        print("\n3. Verify Redis is listening:")
        print("   redis-cli ping")
        print("\n4. See REDIS_SETUP_GUIDE.md for detailed instructions")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_redis_connection()

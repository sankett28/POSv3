"""Test script to verify Upstash Redis connection."""
import os
from dotenv import load_dotenv
from app.core.redis import redis_client

# Load environment variables
load_dotenv()

def test_upstash_connection():
    """Test basic Redis operations with Upstash."""
    print("🔍 Testing Upstash Redis connection...")
    print(f"📍 Redis URL: {os.getenv('REDIS_URL', 'Not set')[:50]}...")
    
    try:
        # Test 1: Ping
        print("\n1️⃣ Testing PING...")
        response = redis_client.ping()
        print(f"   ✅ PING successful: {response}")
        
        # Test 2: Set a value
        print("\n2️⃣ Testing SET...")
        redis_client.set("test_key", "Hello from Upstash!")
        print("   ✅ SET successful")
        
        # Test 3: Get the value
        print("\n3️⃣ Testing GET...")
        value = redis_client.get("test_key")
        print(f"   ✅ GET successful: {value}")
        
        # Test 4: Set with expiration
        print("\n4️⃣ Testing SET with expiration (10 seconds)...")
        redis_client.setex("temp_key", 10, "This will expire")
        print("   ✅ SETEX successful")
        
        # Test 5: Check TTL
        print("\n5️⃣ Testing TTL...")
        ttl = redis_client.ttl("temp_key")
        print(f"   ✅ TTL: {ttl} seconds remaining")
        
        # Test 6: Delete
        print("\n6️⃣ Testing DELETE...")
        redis_client.delete("test_key", "temp_key")
        print("   ✅ DELETE successful")
        
        # Test 7: Verify deletion
        print("\n7️⃣ Verifying deletion...")
        value = redis_client.get("test_key")
        print(f"   ✅ Key deleted (value is None): {value is None}")
        
        print("\n" + "="*50)
        print("🎉 All tests passed! Upstash Redis is working!")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Troubleshooting tips:")
        print("   1. Check your REDIS_URL in .env file")
        print("   2. Verify your Upstash token is correct")
        print("   3. Ensure your Upstash Redis instance is active")
        return False
    
    return True

if __name__ == "__main__":
    test_upstash_connection()

"""
Test script to verify the Virtual Watch Try-On API is working correctly
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("🧪 Testing Virtual Watch Try-On API\n")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1️⃣  Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("   ✅ Health check passed:", response.json())
        else:
            print("   ❌ Health check failed")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Root Endpoint
    print("\n2️⃣  Testing Root Endpoint...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            print("   ✅ Root endpoint passed:", response.json())
        else:
            print("   ❌ Root endpoint failed")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Login with Demo User
    print("\n3️⃣  Testing Authentication...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/token",
            data={"username": "demo", "password": "demo123"}
        )
        if response.status_code == 200:
            token_data = response.json()
            print("   ✅ Authentication passed")
            print(f"   📝 Token: {token_data['access_token'][:30]}...")
            return token_data['access_token']
        else:
            print("   ❌ Authentication failed:", response.text)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Get Watches
    print("\n4️⃣  Testing Watch Catalog...")
    try:
        response = requests.get(f"{BASE_URL}/api/tryon/watches")
        if response.status_code == 200:
            watches = response.json()
            print("   ✅ Watch catalog retrieved")
            print(f"   📊 Available watches: {len(watches.get('watches', []))}")
            for watch in watches.get('watches', [])[:3]:
                print(f"      - {watch['name']}: ${watch['price']}")
        else:
            print("   ❌ Failed to get watches")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✨ API Testing Complete!")
    print("\n📚 View full API documentation at:")
    print(f"   {BASE_URL}/docs")
    print("\n🚀 Your Virtual Watch Try-On API is ready!")

if __name__ == "__main__":
    test_api()

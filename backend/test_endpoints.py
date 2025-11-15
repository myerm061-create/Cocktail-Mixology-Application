"""
Manual test script for pantry and recommendations endpoints.
Run this after starting the server: uvicorn app.main:app --reload
"""
import json

import httpx

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Test user credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"


def print_response(title: str, response: httpx.Response):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")


def main():
    """Run manual tests."""
    print("🧪 Manual Endpoint Tests")
    print(f"Testing against: {BASE_URL}")
    print("\nMake sure the server is running: uvicorn app.main:app --reload")

    with httpx.Client() as client:
        # Step 1: Register a test user
        print("\n📝 Step 1: Register test user")
        register_data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        register_resp = client.post(f"{API_BASE}/auth/register", json=register_data)
        print_response("Register User", register_resp)

        if register_resp.status_code != 201:
            print("\n❌ Registration failed. Trying login instead...")
            login_data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
            login_resp = client.post(f"{API_BASE}/auth/login", json=login_data)
            print_response("Login", login_resp)
            if login_resp.status_code != 200:
                print("\n❌ Both registration and login failed. Exiting.")
                return
            tokens = login_resp.json()
        else:
            tokens = register_resp.json()

        access_token = tokens.get("access_token")
        if not access_token:
            print("\n❌ No access token received. Exiting.")
            return

        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Get empty pantry
        print("\n📦 Step 2: Get empty pantry")
        pantry_resp = client.get(f"{API_BASE}/users/me/pantry", headers=headers)
        print_response("Get Pantry (empty)", pantry_resp)

        # Step 3: Add ingredients to pantry
        print("\n➕ Step 3: Add ingredients to pantry")
        ingredients_to_add = [
            {"ingredient_name": "Gin", "quantity": 1.0},
            {"ingredient_name": "Lime Juice", "quantity": 0.5},
            {"ingredient_name": "Simple Syrup", "quantity": 1.0},
        ]

        for ingredient in ingredients_to_add:
            add_resp = client.post(
                f"{API_BASE}/users/me/pantry", json=ingredient, headers=headers
            )
            print_response(f"Add {ingredient['ingredient_name']}", add_resp)

        # Step 4: Get pantry with ingredients
        print("\n📦 Step 4: Get pantry with ingredients")
        pantry_resp = client.get(f"{API_BASE}/users/me/pantry", headers=headers)
        print_response("Get Pantry (with ingredients)", pantry_resp)

        # Step 5: Get recommendations
        print("\n🍹 Step 5: Get recommendations")
        rec_resp = client.get(
            f"{API_BASE}/recommendations?limit=5", headers=headers
        )
        print_response("Get Recommendations", rec_resp)

        # Step 6: Get recommendations (fully makeable only)
        print("\n🍹 Step 6: Get recommendations (fully makeable only)")
        rec_resp = client.get(
            f"{API_BASE}/recommendations?limit=5&fully_makeable_only=true",
            headers=headers,
        )
        print_response("Get Recommendations (fully makeable)", rec_resp)

        # Step 7: Update ingredient quantity
        print("\n✏️ Step 7: Update ingredient quantity")
        pantry_data = pantry_resp.json()
        if pantry_data:
            first_item = pantry_data[0]
            update_resp = client.put(
                f"{API_BASE}/users/me/pantry/{first_item['id']}",
                json={"quantity": 0.75},
                headers=headers,
            )
            print_response("Update Quantity", update_resp)

        # Step 8: Delete ingredient
        print("\n🗑️ Step 8: Delete ingredient from pantry")
        if pantry_data:
            first_item = pantry_data[0]
            delete_resp = client.delete(
                f"{API_BASE}/users/me/pantry/{first_item['id']}",
                headers=headers,
            )
            print_response("Delete Ingredient", delete_resp)

        print("\n✅ All tests completed!")


if __name__ == "__main__":
    main()


import json
import sys

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    sys.exit(1)

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"


class Colors:
    """ANSI color codes for terminal output"""

    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def print_colored(text, color=Colors.ENDC):
    """Print colored text"""
    print(f"{color}{text}{Colors.ENDC}")


def test_health():
    """Test if the API is running"""
    print_colored("\n=== Testing Health Endpoint ===", Colors.HEADER)
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code == 200:
            print_colored(f"✓ API is healthy: {response.json()}", Colors.OKGREEN)
            return True
        else:
            print_colored(f"✗ Unexpected status: {response.status_code}", Colors.FAIL)
            return False
    except requests.exceptions.ConnectionError:
        print_colored("✗ Cannot connect to API. Is the server running?", Colors.FAIL)
        return False
    except Exception as e:
        print_colored(f"✗ Error: {e}", Colors.FAIL)
        return False


def test_otp_request(email, intent="verify"):
    """Test requesting an OTP"""
    print_colored(f"\n=== Testing OTP Request ({intent}) ===", Colors.HEADER)
    print(f"Email: {email}")

    payload = {"email": email, "intent": intent}

    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/otp/request",
            json=payload,
            headers={"Content-Type": "application/json"},
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            print_colored(f"✓ Success: {response.json()}", Colors.OKGREEN)
            return True
        else:
            print_colored(f"✗ Error: {response.text}", Colors.FAIL)
            try:
                error_detail = response.json()
                print(f"Detail: {error_detail.get('detail', 'No detail')}")
            except Exception:
                pass
            return False
    except Exception as e:
        print_colored(f"✗ Error: {e}", Colors.FAIL)
        return False


def test_otp_debug(email, intent="verify"):
    """Test debug endpoint to get the actual OTP code"""
    print_colored("\n=== Getting OTP via Debug Endpoint ===", Colors.HEADER)

    payload = {"email": email, "intent": intent}

    headers = {"Content-Type": "application/json", "X-Debug-OTP": "true"}

    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/otp/request/debug", json=payload, headers=headers
        )

        if response.status_code == 200:
            data = response.json()
            if "code" in data:
                print_colored(f"✓ OTP Code: {data['code']}", Colors.WARNING)
                return data["code"]
            else:
                print_colored(f"Response: {data}", Colors.OKBLUE)
                return None
        else:
            print_colored(
                f"✗ Debug endpoint returned {response.status_code}", Colors.FAIL
            )
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print_colored(f"✗ Error: {e}", Colors.FAIL)
        return None


def test_otp_verify(email, code, intent="verify"):
    """Test OTP verification"""
    print_colored("\n=== Testing OTP Verification ===", Colors.HEADER)
    print(f"Email: {email}")
    print(f"Code: {code}")
    print(f"Intent: {intent}")

    payload = {"email": email, "code": code, "intent": intent}

    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/otp/verify",
            json=payload,
            headers={"Content-Type": "application/json"},
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print_colored(
                f"✓ Success! Response: {json.dumps(data, indent=2)}", Colors.OKGREEN
            )
            return True
        else:
            print_colored(f"✗ Verification failed: {response.text}", Colors.FAIL)
            return False
    except Exception as e:
        print_colored(f"✗ Error: {e}", Colors.FAIL)
        return False


def test_full_flow(email=TEST_EMAIL):
    """Test the complete OTP flow"""
    print_colored(f"\n{'='*50}", Colors.BOLD)
    print_colored("Testing Complete OTP Flow", Colors.BOLD)
    print_colored(f"Email: {email}", Colors.BOLD)
    print_colored(f"{'='*50}", Colors.BOLD)

    # 1. Check health
    if not test_health():
        print_colored("\n❌ API is not responding", Colors.FAIL)
        return False

    # 2. Request OTP
    if not test_otp_request(email, "verify"):
        print_colored("\n❌ Failed to request OTP", Colors.FAIL)
        print("\nPossible issues:")
        print("1. Check SMTP settings in .env file")
        print("2. Verify email service credentials")
        print("3. Check server logs for details")
        return False

    # 3. Get OTP code via debug endpoint
    otp_code = test_otp_debug(email, "verify")
    if not otp_code:
        print_colored("\n⚠️  Could not get OTP from debug endpoint", Colors.WARNING)
        otp_code = input("\nEnter OTP code manually (check your email): ").strip()

    # 4. Verify OTP
    if test_otp_verify(email, otp_code, "verify"):
        print_colored("\n✅ OTP flow completed successfully!", Colors.OKGREEN)
        return True
    else:
        print_colored("\n❌ OTP verification failed", Colors.FAIL)
        return False


def main():
    """Main menu for testing"""
    print_colored("=" * 50, Colors.BOLD)
    print_colored("OTP Authentication Tester", Colors.BOLD)
    print_colored("=" * 50, Colors.BOLD)

    while True:
        print("\n--- Menu ---")
        print("1. Test full OTP flow")
        print("2. Test OTP request only")
        print("3. Test OTP verification")
        print("4. Get OTP via debug endpoint")
        print("5. Test health endpoint")
        print("0. Exit")

        choice = input("\nSelect option: ").strip()

        if choice == "0":
            break
        elif choice == "1":
            email = (
                input("Enter email (or press Enter for default): ").strip()
                or TEST_EMAIL
            )
            test_full_flow(email)
        elif choice == "2":
            email = input("Enter email: ").strip()
            intent = input("Intent (login/verify/reset/delete): ").strip() or "verify"
            test_otp_request(email, intent)
        elif choice == "3":
            email = input("Enter email: ").strip()
            code = input("Enter OTP code: ").strip()
            intent = input("Intent (login/verify/reset/delete): ").strip() or "verify"
            test_otp_verify(email, code, intent)
        elif choice == "4":
            email = input("Enter email: ").strip()
            intent = input("Intent (login/verify/reset/delete): ").strip() or "verify"
            test_otp_debug(email, intent)
        elif choice == "5":
            test_health()
        else:
            print("Invalid option")


if __name__ == "__main__":
    main()

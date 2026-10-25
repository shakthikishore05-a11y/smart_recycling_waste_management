import urllib.request
import json
import io
import mimetypes
from PIL import Image

def get_live_outputs():
    base_url = "http://127.0.0.1:8000"
    
    # 1. System Health
    with urllib.request.urlopen(f"{base_url}/api/health") as r:
        health = json.loads(r.read())
        print("=== 1. SYSTEM HEALTH OUTPUT ===")
        print(json.dumps(health, indent=2))
        
    # 2. Authentication Login
    login_payload = json.dumps({"email": "user@smartrecycling.org", "password": "User@123456"}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/v1/auth/login",
        data=login_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        login_resp = json.loads(r.read())
        token = login_resp["access_token"]
        user = login_resp["user"]
        print("\n=== 2. AUTHENTICATION (DEMO USER) OUTPUT ===")
        print(f"Logged in as: {user['full_name']} <{user['email']}>")
        print(f"Role: {user['role']} | Eco-Points Balance: {user['eco_points']} pts")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. User Dashboard Summary Metrics
    req = urllib.request.Request(f"{base_url}/api/v1/dashboard/summary", headers=headers)
    with urllib.request.urlopen(req) as r:
        summary = json.loads(r.read())
        print("\n=== 3. USER DASHBOARD SUMMARY ANALYTICS OUTPUT ===")
        print(json.dumps(summary, indent=2))

    # 4. AI Waste Classifier (Inference on real sample image)
    img = Image.new("RGB", (128, 128), color=(40, 160, 80))
    img_buf = io.BytesIO()
    img.save(img_buf, format="JPEG")
    img_bytes = img_buf.getvalue()
    
    # Multipart form upload
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="sample_plastic_bottle.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + img_bytes + f"\r\n--{boundary}--\r\n".encode()

    classify_req = urllib.request.Request(
        f"{base_url}/api/v1/classify",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {token}"
        }
    )
    with urllib.request.urlopen(classify_req) as r:
        classify_resp = json.loads(r.read())
        print("\n=== 4. AI WASTE CLASSIFIER INFERENCE OUTPUT ===")
        # Print key classification fields
        display_dict = {
            "predicted_category": classify_resp["predicted_category"],
            "display_name": classify_resp["display_name"],
            "confidence": f"{classify_resp['confidence'] * 100:.1f}%",
            "is_confident": classify_resp["is_confident"],
            "classification_type": classify_resp["classification_type"],
            "recycling_instructions": classify_resp["recycling_instructions"],
            "preparation_checklist": classify_resp["preparation_checklist"],
            "reuse_suggestions": classify_resp["reuse_suggestions"],
            "environmental_impact": classify_resp["environmental_impact"],
            "safety_notes": classify_resp["safety_notes"],
            "all_probabilities": classify_resp["all_probabilities"]
        }
        print(json.dumps(display_dict, indent=2))

    # 5. Gamification Challenges Status
    req = urllib.request.Request(f"{base_url}/api/v1/gamification/challenges", headers=headers)
    with urllib.request.urlopen(req) as r:
        challenges = json.loads(r.read())
        print("\n=== 5. USER ECO-CHALLENGES OUTPUT ===")
        for ch in challenges:
            status = "COMPLETED" if ch["is_completed"] else f"IN PROGRESS ({ch['progress']}/{ch['target']})"
            print(f"- [{status}] {ch['title']}: {ch['description']} (+{ch['points_reward']} pts)")

    # 6. AI Assistant Knowledge-Base Chat
    chat_payload = json.dumps({"content": "Can I recycle a greasy pizza box?"}).encode()
    chat_req = urllib.request.Request(
        f"{base_url}/api/v1/assistant/chat",
        data=chat_payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(chat_req) as r:
        chat_resp = json.loads(r.read())
        print("\n=== 6. AI RECYCLING ASSISTANT CHAT OUTPUT ===")
        print(f"User Query: 'Can I recycle a greasy pizza box?'")
        print(f"Assistant Response:\n{chat_resp['content']}")

    # 7. Verified Facilities Directory (Top 2)
    req = urllib.request.Request(f"{base_url}/api/v1/facilities", headers=headers)
    with urllib.request.urlopen(req) as r:
        facilities = json.loads(r.read())
        print("\n=== 7. RECYCLING FACILITIES DIRECTORY OUTPUT ===")
        for fac in facilities[:2]:
            print(f"- {fac['name']} ({fac['city']}, {fac['postal_code']})")
            print(f"  Accepted: {', '.join(fac['accepted_materials'])}")
            print(f"  Hours: {fac['operating_hours']}")

if __name__ == "__main__":
    get_live_outputs()

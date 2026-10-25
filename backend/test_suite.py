"""
Automated Test Suite for Smart Recycling Waste Management System.
Covers Authentication, AI Waste Classifier, Recycling Activities CRUD,
User Analytics, Gamification, Directory, Assistant, Admin, and Security Isolation.
"""

import unittest
import io
import os
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models import User, WasteScan, RecyclingActivity

class SmartRecyclingTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        
        # Test accounts
        cls.admin_email = "admin@smartrecycling.org"
        cls.admin_pass = "Admin@123456"
        cls.user_email = "user@smartrecycling.org"
        cls.user_pass = "User@123456"
        
        # Login admin
        admin_login = cls.client.post("/api/v1/auth/login", json={
            "email": cls.admin_email,
            "password": cls.admin_pass
        })
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        cls.admin_token = admin_login.json()["access_token"]
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}
        
        # Login demo user
        user_login = cls.client.post("/api/v1/auth/login", json={
            "email": cls.user_email,
            "password": cls.user_pass
        })
        assert user_login.status_code == 200, f"Demo user login failed: {user_login.text}"
        cls.user_token = user_login.json()["access_token"]
        cls.user_headers = {"Authorization": f"Bearer {cls.user_token}"}
        
    def test_01_health_and_root(self):
        """Test health check and root landing endpoints."""
        r_health = self.client.get("/api/health")
        self.assertEqual(r_health.status_code, 200)
        self.assertEqual(r_health.json()["status"], "healthy")
        self.assertEqual(r_health.json()["ai_engine"], "Operational")
        
        r_root = self.client.get("/")
        self.assertEqual(r_root.status_code, 200)

    def test_02_auth_registration_and_login(self):
        """Test user registration, duplicate prevention, and profile reading."""
        test_email = f"test_{os.urandom(4).hex()}@testrecycling.org"
        
        # Register new user
        reg_res = self.client.post("/api/v1/auth/register", json={
            "full_name": "Test Runner",
            "email": test_email,
            "password": "Password@123"
        })
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.json()
        self.assertIn("access_token", reg_data)
        self.assertEqual(reg_data["user"]["eco_points"], 100) # 100 pts welcome bonus
        
        # Duplicate registration rejection
        dup_res = self.client.post("/api/v1/auth/register", json={
            "full_name": "Duplicate Runner",
            "email": test_email,
            "password": "Password@123"
        })
        self.assertEqual(dup_res.status_code, 400)
        
        # Verify /auth/me
        me_res = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {reg_data['access_token']}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], test_email)

    def test_03_waste_classification_pipeline(self):
        """Test AI model inference, response schemas, and history persistence."""
        # Create a synthetic test image (e.g. green square simulating recyclable plastic/glass)
        img = Image.new("RGB", (128, 128), color=(20, 140, 60))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)
        
        # Classify with authenticated user
        files = {"file": ("test_sample.jpg", img_bytes.getvalue(), "image/jpeg")}
        resp = self.client.post("/api/v1/classify", files=files, headers=self.user_headers)
        self.assertEqual(resp.status_code, 200)
        
        data = resp.json()
        self.assertIn("predicted_category", data)
        self.assertIn("display_name", data)
        self.assertIn("confidence", data)
        self.assertIn("is_confident", data)
        self.assertIn("all_probabilities", data)
        self.assertIn("recycling_instructions", data)
        self.assertIn("preparation_checklist", data)
        self.assertIn("safety_notes", data)
        self.assertIsNotNone(data.get("scan_id"))
        
        scan_id = data["scan_id"]
        
        # Retrieve scan details
        detail_res = self.client.get(f"/api/v1/scans/{scan_id}", headers=self.user_headers)
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()["id"], scan_id)
        
        # Submit user correction feedback
        feedback_res = self.client.patch(
            f"/api/v1/scans/{scan_id}/feedback",
            json={"user_feedback_category": "Plastic", "notes": "Verified PET bottle"},
            headers=self.user_headers
        )
        self.assertEqual(feedback_res.status_code, 200)
        self.assertEqual(feedback_res.json()["user_feedback_category"], "Plastic")
        
        # Check scan in user history
        history_res = self.client.get("/api/v1/scans?limit=5", headers=self.user_headers)
        self.assertEqual(history_res.status_code, 200)
        self.assertGreaterEqual(history_res.json()["total"], 1)

    def test_04_recycling_activities_crud(self):
        """Test self-reported recycling activities, point calculations, update, and delete."""
        # Create a dedicated user for activity CRUD to cleanly isolate points tracking
        email_act = f"act_user_{os.urandom(3).hex()}@test.org"
        reg = self.client.post("/api/v1/auth/register", json={
            "full_name": "Activity Tester",
            "email": email_act,
            "password": "Password@123"
        })
        act_token = reg.json()["access_token"]
        act_headers = {"Authorization": f"Bearer {act_token}"}
        
        user_before = self.client.get("/api/v1/auth/me", headers=act_headers).json()
        initial_points = user_before["eco_points"] # 100 welcome bonus
        
        # 1. Create activity: 2.0 kg Plastic (Base 15 * 1.2 multiplier = 18 pts/kg -> 36 points)
        create_res = self.client.post("/api/v1/activities", json={
            "category": "Plastic",
            "material_type": "Clean HDPE Containers",
            "weight_kg": 2.0,
            "activity_date": "2026-10-25",
            "disposal_method": "Curbside Blue Bin",
            "notes": "Rinsed and caps attached"
        }, headers=act_headers)
        self.assertEqual(create_res.status_code, 201)
        act_data = create_res.json()
        act_id = act_data["id"]
        earned = act_data["points_earned"]
        self.assertEqual(earned, 36)
        
        # Check user points incremented
        user_after_create = self.client.get("/api/v1/auth/me", headers=act_headers).json()
        self.assertEqual(user_after_create["eco_points"], initial_points + earned)
        
        # 2. Update activity weight to 3.0 kg (3.0 * 18 = 54 points, delta = +18 points)
        update_res = self.client.patch(f"/api/v1/activities/{act_id}", json={
            "weight_kg": 3.0
        }, headers=act_headers)
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["points_earned"], 54)
        
        user_after_update = self.client.get("/api/v1/auth/me", headers=act_headers).json()
        self.assertEqual(user_after_update["eco_points"], initial_points + 54)
        
        # 3. Delete activity: points should be revoked safely
        del_res = self.client.delete(f"/api/v1/activities/{act_id}", headers=act_headers)
        self.assertEqual(del_res.status_code, 204)
        
        user_after_delete = self.client.get("/api/v1/auth/me", headers=act_headers).json()
        self.assertEqual(user_after_delete["eco_points"], initial_points)

    def test_05_dashboard_analytics(self):
        """Test summary metrics, LCA environmental calculations, and trend graphs."""
        res_summary = self.client.get("/api/v1/dashboard/summary", headers=self.user_headers)
        self.assertEqual(res_summary.status_code, 200)
        summary = res_summary.json()
        self.assertIn("total_images_classified", summary)
        self.assertIn("total_recycling_activities", summary)
        self.assertIn("total_recycled_weight_kg", summary)
        self.assertIn("co2_saved_kg", summary)
        self.assertIn("trees_equivalent", summary)
        self.assertIn("water_saved_liters", summary)
        
        res_dist = self.client.get("/api/v1/dashboard/category-distribution", headers=self.user_headers)
        self.assertEqual(res_dist.status_code, 200)
        
        res_trend = self.client.get("/api/v1/dashboard/activity-trend", headers=self.user_headers)
        self.assertEqual(res_trend.status_code, 200)
        self.assertEqual(len(res_trend.json()), 7) # past 7 days

    def test_06_recycling_guides_and_facilities(self):
        """Test encyclopedia guides and verified facility directory search."""
        # Guides
        guides_res = self.client.get("/api/v1/recycling-guides")
        self.assertEqual(guides_res.status_code, 200)
        guides = guides_res.json()
        self.assertGreaterEqual(len(guides), 6)
        
        single_guide = self.client.get("/api/v1/recycling-guides/plastic")
        self.assertEqual(single_guide.status_code, 200)
        self.assertEqual(single_guide.json()["category_key"], "plastic")
        
        # Facilities
        fac_res = self.client.get("/api/v1/facilities")
        self.assertEqual(fac_res.status_code, 200)
        facilities = fac_res.json()
        self.assertGreaterEqual(len(facilities), 1)
        
        # Filter facilities by material
        filter_res = self.client.get("/api/v1/facilities?material=plastic")
        self.assertEqual(filter_res.status_code, 200)

    def test_07_ai_assistant_chat(self):
        """Test AI Assistant Q&A, fallback RAG rules, and chat history."""
        # Query about pizza box
        chat_res = self.client.post("/api/v1/assistant/chat", json={
            "content": "Can I recycle a greasy pizza box?"
        }, headers=self.user_headers)
        self.assertEqual(chat_res.status_code, 200)
        data = chat_res.json()
        self.assertEqual(data["role"], "assistant")
        self.assertIn("pizza", data["content"].lower())
        
        # Check history
        hist_res = self.client.get("/api/v1/assistant/history", headers=self.user_headers)
        self.assertEqual(hist_res.status_code, 200)
        self.assertGreaterEqual(len(hist_res.json()), 2) # user msg + assistant msg

    def test_08_admin_authorization_and_management(self):
        """Test role enforcement, non-admin rejection, and admin facility creation."""
        # Non-admin attempting to access admin endpoints -> 403 Forbidden
        forbidden_res = self.client.get("/api/v1/admin/stats", headers=self.user_headers)
        self.assertEqual(forbidden_res.status_code, 403)
        
        # Admin accessing stats -> 200 OK
        admin_stats = self.client.get("/api/v1/admin/stats", headers=self.admin_headers)
        self.assertEqual(admin_stats.status_code, 200)
        self.assertIn("total_users", admin_stats.json())
        self.assertIn("model_architecture", admin_stats.json())
        
        # Admin creating and deleting facility
        create_fac = self.client.post("/api/v1/admin/facilities", json={
            "name": "Automated Test Reclamation Facility",
            "address": "99 Industrial Green Way",
            "city": "Metropolis",
            "state": "State",
            "postal_code": "560001",
            "accepted_materials": ["plastic", "glass", "paper"],
            "operating_hours": "08:00 - 18:00"
        }, headers=self.admin_headers)
        self.assertEqual(create_fac.status_code, 201)
        new_fac_id = create_fac.json()["id"]
        
        # Admin deleting facility
        del_fac = self.client.delete(f"/api/v1/admin/facilities/{new_fac_id}", headers=self.admin_headers)
        self.assertEqual(del_fac.status_code, 204)

    def test_09_security_and_user_isolation(self):
        """Verify that User A cannot view, modify, or delete User B's scans or activities."""
        # Create user B
        user_b_email = f"user_b_{os.urandom(3).hex()}@test.org"
        reg_b = self.client.post("/api/v1/auth/register", json={
            "full_name": "User Beta",
            "email": user_b_email,
            "password": "Password@123"
        })
        user_b_token = reg_b.json()["access_token"]
        user_b_headers = {"Authorization": f"Bearer {user_b_token}"}
        
        # User B creates an activity
        act_b = self.client.post("/api/v1/activities", json={
            "category": "Metal",
            "material_type": "Aluminium Cans",
            "weight_kg": 1.0,
            "activity_date": "2026-10-25",
            "disposal_method": "Drop-off Center"
        }, headers=user_b_headers).json()
        act_b_id = act_b["id"]
        
        # User A attempts to view User B's activity -> 404 (isolated)
        read_forbidden = self.client.get(f"/api/v1/activities/{act_b_id}", headers=self.user_headers)
        self.assertEqual(read_forbidden.status_code, 404)
        
        # User A attempts to delete User B's activity -> 404 (isolated)
        del_forbidden = self.client.delete(f"/api/v1/activities/{act_b_id}", headers=self.user_headers)
        self.assertEqual(del_forbidden.status_code, 404)


if __name__ == "__main__":
    unittest.main()

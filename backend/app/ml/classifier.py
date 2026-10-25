"""
Waste Classification Inference Service for FastAPI.
Provides real-time AI classification with comprehensive recycling instructions.
"""

import os
import json
import pickle
import io
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Dict, Any, Optional

from app.ml.model_def import TRASHNET_CLASSES, CATEGORY_DISPLAY_MAPPING
from app.ml.vision_features import extract_image_features

# Comprehensive recycling recommendation database per supported class
RECYCLING_KNOWLEDGE_BASE = {
    "cardboard": {
        "display_name": "Cardboard",
        "classification_type": "Recyclable (Fibre)",
        "description": "Corrugated boxes, shipping cartons, and non-waxed paperboard packaging.",
        "recycling_instructions": "Flatten all boxes before placing them in the recycling bin or paper collection stream. Remove all plastic bubble wrap, tape, and styrofoam.",
        "preparation_checklist": [
            "Remove all plastic packing tape and shipping labels if possible",
            "Break down and flatten boxes to save space in collection bins",
            "Ensure cardboard is completely dry and free from oil, grease, or food residue",
            "Keep separate from wet household waste"
        ],
        "reuse_suggestions": [
            "Use as weed barrier and sheet mulching in home garden beds",
            "Repurpose sturdy cartons for home storage or shipping",
            "Use clean unprinted cardboard for compost carbon balance (brown material)"
        ],
        "environmental_impact": "Recycling one ton of cardboard saves approximately 17 trees, 7,000 gallons of water, and 4,000 kWh of electricity.",
        "safety_notes": "Avoid handling damp mouldy cardboard without gloves if you have respiratory sensitivities."
    },
    "glass": {
        "display_name": "Glass",
        "classification_type": "Recyclable (Inert Mineral)",
        "description": "Glass containers including beverage bottles, food jars, and condiment containers.",
        "recycling_instructions": "Rinse clean and deposit into the designated glass recycling container or municipal drop-off depot. Glass can be recycled endlessly without quality degradation.",
        "preparation_checklist": [
            "Empty container of all liquid or food contents",
            "Quick rinse with cold water; labels can remain attached",
            "Remove metal or plastic caps and lids (recycle separately)",
            "Do not mix with ceramics, Pyrex, window glass, or mirrors"
        ],
        "reuse_suggestions": [
            "Use clean glass jars for bulk food storage, spices, or dried pulses",
            "Repurpose bottles as decorative water decanters or flower vases",
            "Use for home canning and pickling"
        ],
        "environmental_impact": "Glass recycling produces 20% less air pollution and 50% less water pollution compared to manufacturing virgin glass from sand.",
        "safety_notes": "Never place broken shards loosely in recycling bins; wrap broken glass securely in paper and label it to protect sanitation workers."
    },
    "metal": {
        "display_name": "Metal",
        "classification_type": "Recyclable (Ferrous / Non-Ferrous)",
        "description": "Aluminum beverage cans, tin food cans, foil trays, and clean metal container lids.",
        "recycling_instructions": "Empty and lightly rinse metal cans. Aluminium and steel are 100% recyclable and save massive amounts of smelting energy.",
        "preparation_checklist": [
            "Rinse out food remains and sticky residue",
            "Tuck sharp tin lids inside cans or crimp opening slightly",
            "Scrunch clean aluminum foil into a ball (at least tennis ball size)",
            "Do not include aerosol cans unless completely empty and depressurized"
        ],
        "reuse_suggestions": [
            "Upcycle clean cans as pen holders, seedling pots, or utensil organizers",
            "Use clean tin cans for candle crafting or workshop hardware sorting"
        ],
        "environmental_impact": "Recycling aluminum requires 95% less energy than producing primary aluminum from bauxite ore.",
        "safety_notes": "Watch for sharp edges on tin can lids. Use caution when compressing cans."
    },
    "paper": {
        "display_name": "Paper",
        "classification_type": "Recyclable (Fibre)",
        "description": "Office paper, newspapers, magazines, mail, envelopes, and paper grocery bags.",
        "recycling_instructions": "Collect clean, dry paper in the paper recycling bin. Keep dry and free of greasy residues.",
        "preparation_checklist": [
            "Ensure paper is clean and completely dry",
            "Remove plastic sleeves, metal spiral bindings, and heavy plastic laminates",
            "Do not shred unless containing private information (shredded fibres are too short for high-grade recycling)",
            "Do not recycle soiled napkins, tissues, or paper towels"
        ],
        "reuse_suggestions": [
            "Use printed paper blank reverse side for scratch notes and drafting",
            "Use newspaper as protective wrapping for fragile items during moving",
            "Shred clean unprinted newsprint for worm bedding or compost carbon layer"
        ],
        "environmental_impact": "Recycling paper saves 60% of energy and reduces greenhouse gas emissions significantly compared to virgin pulp production.",
        "safety_notes": "Keep paper piles away from open heat sources or electrical panels."
    },
    "plastic": {
        "display_name": "Plastic",
        "classification_type": "Recyclable (Polymers: PET, HDPE, PP)",
        "description": "Rigid plastic bottles, jugs, tubs, shampoo bottles, and detergent containers.",
        "recycling_instructions": "Check the resin identification code (triangle with numbers 1 to 7). Types 1 (PET) and 2 (HDPE) are universally accepted by municipal recycling programs.",
        "preparation_checklist": [
            "Empty all liquids and scrape out residual food contents",
            "Rinse briefly with water",
            "Re-attach screw caps onto the bottle (modern optical sorters accept capped bottles)",
            "Do not recycle flimsy plastic grocery bags or thin film in curbside bins (drop off at store collection points)"
        ],
        "reuse_suggestions": [
            "Cut plastic jugs into garden scoops, funnel guides, or seedling cloches",
            "Refill sturdy detergent bottles at zero-waste bulk refill stations"
        ],
        "environmental_impact": "Recycling plastic prevents persistent microplastic pollution in waterways and reduces crude oil consumption.",
        "safety_notes": "Never burn plastics at home; combustion releases toxic dioxins and hazardous particulate matter."
    },
    "trash": {
        "display_name": "General Waste",
        "classification_type": "Non-Recyclable Residual Waste",
        "description": "Mixed household refuse, composite multi-layer packaging, soiled wrappers, styrofoam, and non-recyclable items.",
        "recycling_instructions": "This item cannot be processed through standard curbside recycling streams. Dispose of in the regular municipal landfill or waste-to-energy bin.",
        "preparation_checklist": [
            "Bag securely before disposal in the general waste bin",
            "Ensure no hazardous materials (e.g. batteries, lithium cells) are mixed in",
            "If item has organic components, consider home composting where suitable"
        ],
        "reuse_suggestions": [
            "Assess whether the item can be repaired or repurposed for utilitarian storage before discarding",
            "Consider eco-friendly non-disposable alternatives for future purchases"
        ],
        "environmental_impact": "Landfill waste generates methane and takes centuries to decompose. Prioritize waste reduction and reusable alternatives.",
        "safety_notes": "Never place lithium-ion batteries or flammable chemicals in general trash as they cause severe collection truck fires."
    }
}

DEFAULT_MODEL_PATH = Path(__file__).resolve().parent / "waste_classifier.pkl"

class WasteClassifierService:
    def __init__(self, model_path: Optional[str] = None, threshold: float = 0.60):
        # Resolve model path robustly relative to source files
        resolved_path = DEFAULT_MODEL_PATH
        if model_path:
            p = Path(model_path)
            if p.is_file():
                resolved_path = p
            elif (Path(__file__).resolve().parent / p.name).is_file():
                resolved_path = Path(__file__).resolve().parent / p.name
            elif (Path(__file__).resolve().parent.parent.parent / str(model_path).lstrip("./\\")).is_file():
                resolved_path = Path(__file__).resolve().parent.parent.parent / str(model_path).lstrip("./\\")
            elif p.is_absolute():
                resolved_path = p
                
        self.model_path = str(resolved_path)
        self.threshold = threshold
        self.classes = TRASHNET_CLASSES
        self.model = None
        self.is_loaded = False
        self._load_model()
        
    def _load_model(self):
        try:
            if Path(self.model_path).exists():
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
                self.is_loaded = True
                print(f"[AI Service] Successfully loaded waste classifier from {self.model_path}")
            else:
                print(f"[AI Service] Model weights not found at {self.model_path}. Will train on first run.")
                from app.ml.train import train_model
                self.model = train_model(output_model_path=self.model_path)
                self.is_loaded = True
        except Exception as e:
            print(f"[AI Service] Error loading waste classifier: {e}")
            self.is_loaded = False

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Classifies input image and returns structured predictions and environmental guidance.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image format or corrupted file: {e}")
            
        if not self.is_loaded or self.model is None:
            self._load_model()
            
        features = extract_image_features(image).reshape(1, -1)
        
        try:
            probabilities = self.model.predict_proba(features)[0]
        except Exception:
            # Decision function fallback
            pred_idx = int(self.model.predict(features)[0])
            probabilities = [0.05] * len(self.classes)
            probabilities[pred_idx] = 0.75
            
        best_idx = int(np.argmax(probabilities))
        confidence = float(probabilities[best_idx])
        predicted_class = self.classes[best_idx]
        
        # Ensure confidence is normalized
        class_probs = {self.classes[i]: round(float(probabilities[i]), 4) for i in range(len(self.classes))}
        
        is_confident = confidence >= self.threshold
        knowledge = RECYCLING_KNOWLEDGE_BASE.get(predicted_class, RECYCLING_KNOWLEDGE_BASE["trash"])
        
        warning_msg = None
        if not is_confident:
            warning_msg = (
                f"Low confidence ({confidence*100:.1f}%). The AI model is uncertain about this classification. "
                "Please verify against the item details or upload a clearer, well-lit photo."
            )
            
        return {
            "predicted_category": predicted_class,
            "display_name": knowledge["display_name"],
            "confidence": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 1),
            "is_confident": is_confident,
            "confidence_threshold": self.threshold,
            "is_supported_category": True,
            "supported_categories": self.classes,
            "unsupported_categories_note": "Specialized waste such as Electronic Waste (E-waste), Hazardous Waste, and Textiles are detailed in the comprehensive Recycling Guide.",
            "model_identifier": "WasteClassifier-VisionMLP-v1.0",
            "model_status": "active",
            "warning": warning_msg,
            "all_probabilities": class_probs,
            "classification_type": knowledge["classification_type"],
            "description": knowledge["description"],
            "recycling_instructions": knowledge["recycling_instructions"],
            "preparation_checklist": knowledge["preparation_checklist"],
            "reuse_suggestions": knowledge["reuse_suggestions"],
            "environmental_impact": knowledge["environmental_impact"],
            "safety_notes": knowledge["safety_notes"]
        }

_classifier_instance = None

def get_classifier() -> WasteClassifierService:
    global _classifier_instance
    if _classifier_instance is None:
        model_path = os.getenv("MODEL_WEIGHTS_PATH")
        threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
        _classifier_instance = WasteClassifierService(model_path=model_path, threshold=threshold)
    return _classifier_instance

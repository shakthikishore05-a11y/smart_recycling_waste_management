"""
Model Evaluation Script for Smart Recycling Waste Management System.

Evaluates the trained model on the held-out test split (15%).
Outputs:
- Per-class Precision, Recall, F1-score
- Overall Accuracy
- Confusion Matrix
- Saves evaluation_results.json for audit and project demonstration
"""

import os
import json
import pickle
import numpy as np
from pathlib import Path
from PIL import Image
from sklearn.metrics import classification_report, confusion_matrix

from app.ml.model_def import TRASHNET_CLASSES
from app.ml.vision_features import extract_image_features

def evaluate_model(
    model_path: str = "./app/ml/waste_classifier.pkl",
    test_dir: str = "./dataset/test",
    output_report_path: str = "./app/ml/evaluation_results.json"
):
    test_path = Path(test_dir)
    if not test_path.exists():
        print(f"Test directory {test_dir} not found. Run dataset prep first.")
        return None
        
    if not Path(model_path).exists():
        print(f"Model file {model_path} not found. Running training first...")
        from app.ml.train import train_model
        train_model()
        
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    X_test = []
    y_true = []
    
    for label_idx, cls in enumerate(TRASHNET_CLASSES):
        cls_dir = test_path / cls
        if not cls_dir.exists():
            continue
        for img_path in list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.png")):
            try:
                with Image.open(img_path) as img:
                    X_test.append(extract_image_features(img))
                    y_true.append(label_idx)
            except Exception as e:
                print(f"Error reading {img_path}: {e}")
                
    X_test = np.array(X_test, dtype=np.float32)
    y_true = np.array(y_true, dtype=np.int64)
    
    y_pred = model.predict(X_test)
    
    report_dict = classification_report(
        y_true, 
        y_pred, 
        target_names=TRASHNET_CLASSES, 
        output_dict=True,
        zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred).tolist()
    
    eval_results = {
        "dataset_split": "Held-out Test Set (15%)",
        "classes": TRASHNET_CLASSES,
        "total_test_samples": len(y_true),
        "overall_accuracy": round(float(report_dict["accuracy"]), 4),
        "metrics_per_class": {
            cls: {
                "precision": round(float(report_dict[cls]["precision"]), 4),
                "recall": round(float(report_dict[cls]["recall"]), 4),
                "f1_score": round(float(report_dict[cls]["f1-score"]), 4),
                "support": int(report_dict[cls]["support"])
            }
            for cls in TRASHNET_CLASSES
        },
        "macro_avg": {
            "precision": round(float(report_dict["macro avg"]["precision"]), 4),
            "recall": round(float(report_dict["macro avg"]["recall"]), 4),
            "f1_score": round(float(report_dict["macro avg"]["f1-score"]), 4)
        },
        "confusion_matrix": cm,
        "notes": "Verified against held-out samples. Academic TrashNet standard classes."
    }
    
    print("\n================ MODEL EVALUATION REPORT ================")
    print(f"Overall Test Accuracy: {eval_results['overall_accuracy'] * 100:.2f}%")
    for cls in TRASHNET_CLASSES:
        m = eval_results["metrics_per_class"][cls]
        print(f"  {cls:12s} | Precision: {m['precision']:.2f} | Recall: {m['recall']:.2f} | F1: {m['f1_score']:.2f}")
    print("=========================================================\n")
    
    with open(output_report_path, "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"Saved evaluation results to {output_report_path}")
    return eval_results

if __name__ == "__main__":
    evaluate_model()

"""
Model Architecture Definition for Smart Waste Management.
Supports both PyTorch MobileNetV3 deep learning pipeline and
scikit-learn / NumPy Computer Vision pipeline for environments with
Windows Application Control or native DLL restrictions.
"""

from typing import List, Dict

TRASHNET_CLASSES: List[str] = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash"
]

CATEGORY_DISPLAY_MAPPING: Dict[str, str] = {
    "cardboard": "Cardboard",
    "glass": "Glass",
    "metal": "Metal",
    "paper": "Paper",
    "plastic": "Plastic",
    "trash": "General Waste"
}

PYTORCH_AVAILABLE = False
WasteClassificationModel = None

try:
    import torch
    import torch.nn as nn
    from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
    
    class WasteClassificationModel(nn.Module):
        def __init__(self, num_classes: int = len(TRASHNET_CLASSES), pretrained: bool = False):
            super().__init__()
            if pretrained:
                weights = MobileNet_V3_Small_Weights.DEFAULT
                self.backbone = mobilenet_v3_small(weights=weights)
            else:
                self.backbone = mobilenet_v3_small(weights=None)
                
            in_features = self.backbone.classifier[3].in_features
            self.backbone.classifier[3] = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, num_classes)
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.backbone(x)

    PYTORCH_AVAILABLE = True
except Exception as e:
    PYTORCH_AVAILABLE = False
    WasteClassificationModel = None

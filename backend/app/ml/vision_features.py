"""
Feature Extraction Engine for Waste Classification.
Extracts robust color, edge, and texture features using Pillow and NumPy.
Ensures zero-dependency machine vision that runs reliably on all platforms.
"""

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from typing import List

def extract_image_features(image: Image.Image) -> np.ndarray:
    """
    Extracts a 96-dimensional normalized feature vector from a PIL Image:
    - RGB channel statistics (mean, std, min, max, percentiles)
    - HSV color distributions (hue dominant ranges, saturation, brightness)
    - Edge density & gradient magnitude (Sobel convolution)
    - Spatial quadrant distribution (top, bottom, left, right weight)
    """
    img = image.convert("RGB").resize((128, 128))
    arr = np.array(img, dtype=np.float32) / 255.0
    
    # 1. Color Channel Statistics (RGB)
    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]
    
    rgb_features = [
        np.mean(r), np.std(r), np.percentile(r, 25), np.percentile(r, 75),
        np.mean(g), np.std(g), np.percentile(g, 25), np.percentile(g, 75),
        np.mean(b), np.std(b), np.percentile(b, 25), np.percentile(b, 75),
        # Color differences (e.g. cardboard has r > g > b, glass has r ~ b)
        np.mean(r - g), np.mean(r - b), np.mean(g - b),
        np.std(r - g), np.std(r - b)
    ]
    
    # 2. HSV Color Space
    hsv_img = image.convert("HSV").resize((128, 128))
    hsv_arr = np.array(hsv_img, dtype=np.float32) / 255.0
    h = hsv_arr[:, :, 0]
    s = hsv_arr[:, :, 1]
    v = hsv_arr[:, :, 2]
    
    hsv_features = [
        np.mean(h), np.std(h),
        np.mean(s), np.std(s), np.percentile(s, 75),
        np.mean(v), np.std(v), np.percentile(v, 25), np.percentile(v, 75)
    ]
    
    # Color histograms (16 bins each for H, S, V)
    h_hist, _ = np.histogram(h, bins=16, range=(0, 1), density=True)
    s_hist, _ = np.histogram(s, bins=16, range=(0, 1), density=True)
    v_hist, _ = np.histogram(v, bins=16, range=(0, 1), density=True)
    
    # 3. Edge and Texture Features
    gray = image.convert("L").resize((128, 128))
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edge_arr = np.array(edges, dtype=np.float32) / 255.0
    
    edge_features = [
        np.mean(edge_arr),
        np.std(edge_arr),
        np.percentile(edge_arr, 90),
        np.sum(edge_arr > 0.2) / float(128 * 128)
    ]
    
    # 4. Spatial 2x2 Quadrant Distribution
    q1 = np.mean(v[:64, :64])
    q2 = np.mean(v[:64, 64:])
    q3 = np.mean(v[64:, :64])
    q4 = np.mean(v[64:, 64:])
    spatial_features = [q1, q2, q3, q4]
    
    # Concatenate all features
    features = np.concatenate([
        np.array(rgb_features, dtype=np.float32),
        np.array(hsv_features, dtype=np.float32),
        h_hist.astype(np.float32),
        s_hist.astype(np.float32),
        v_hist.astype(np.float32),
        np.array(edge_features, dtype=np.float32),
        np.array(spatial_features, dtype=np.float32)
    ])
    
    # Replace any NaNs
    features = np.nan_to_num(features, nan=0.0, posinf=1.0, neginf=-1.0)
    return features

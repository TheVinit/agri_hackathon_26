"""
AgriPulse — AI Prediction Engine
Requires: Python 3.7+ only (no external packages)

Run with:  python predict.py
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ─── Crop Moisture Thresholds ─────────────────────────────────────────────────
# Values represent soil moisture % (volumetric water content)

CROP_THRESHOLDS = {
    "wheat": {
        "critical": 30,   # Below this → immediate irrigation
        "low":      45,   # Below this → normal irrigation soon
        "optimal":  60,   # Ideal range lower bound
        "high":     80,   # Above this → risk of waterlogging
    },
    "soybean": {
        "critical": 35,
        "low":      50,
        "optimal":  65,
        "high":     85,
    },
    "onion": {
        "critical": 40,
        "low":      55,
        "optimal":  70,
        "high":     90,
    },
    "cotton": {
        "critical": 25,
        "low":      40,
        "optimal":  55,
        "high":     75,
    },
    "sugarcane": {
        "critical": 50,
        "low":      65,
        "optimal":  80,
        "high":     95,
    },
}

# ─── NPK Optimal Ranges ───────────────────────────────────────────────────────
# Each nutrient value is a tuple: (min_optimal, max_optimal)

CROP_NPK_OPTIMAL = {
    "wheat": {
        "N":  (40,  80),
        "P":  (15,  30),
        "K":  (80, 150),
        "pH": (6.0, 7.5),
    },
    "soybean": {
        "N":  (20,  50),
        "P":  (15,  30),
        "K":  (70, 130),
        "pH": (6.0, 7.0),
    },
    # Fallback defaults for crops not explicitly listed
    "_default": {
        "N":  (30,  70),
        "P":  (10,  25),
        "K":  (60, 120),
        "pH": (6.0, 7.5),
    },
}

# Fertilizer recommendations per nutrient
FERTILIZER_MAP = {
    "N":  {"deficient": "Urea (46-0-0)",          "excess": "Reduce nitrogen inputs; apply potassium"},
    "P":  {"deficient": "DAP (18-46-0)",           "excess": "Avoid P fertilizers; improve drainage"},
    "K":  {"deficient": "Muriate of Potash (MOP)", "excess": "Leach with irrigation; reduce K inputs"},
    "pH": {"deficient": "Lime (raise pH)",         "excess": "Sulphur / acidifying fertilizer (lower pH)"},
}

DOSE_MAP = {
    "N":  {"low": "30 kg/ha", "high": "Consult agronomist"},
    "P":  {"low": "20 kg/ha", "high": "Consult agronomist"},
    "K":  {"low": "25 kg/ha", "high": "Consult agronomist"},
    "pH": {"low": "250 kg/ha lime", "high": "15 kg/ha sulphur"},
}


# ─── Irrigation Prediction ────────────────────────────────────────────────────

def predict_irrigation(moisture, crop, rain_expected_48h=False):
    """
    Predict whether irrigation is needed based on soil moisture and crop type.

    Args:
        moisture        (float): Current soil moisture percentage (0–100).
        crop            (str):   Crop name (must exist in CROP_THRESHOLDS).
        rain_expected_48h (bool): If True, skip irrigation recommendation.

    Returns:
        dict with keys:
            irrigate     (bool)   — Whether to irrigate now
            duration_min (int)    — Recommended irrigation duration in minutes
            urgency      (str)    — "CRITICAL" | "NORMAL" | "NONE"
            reason       (str)    — Human-readable explanation
    """
    crop_lower = crop.lower()
    thresholds = CROP_THRESHOLDS.get(crop_lower)

    if thresholds is None:
        return {
            "irrigate":     False,
            "duration_min": 0,
            "urgency":      "NONE",
            "reason":       f"Unknown crop '{crop}'. No thresholds available.",
        }

    # Skip if rain is expected in the next 48 hours
    if rain_expected_48h:
        return {
            "irrigate":     False,
            "duration_min": 0,
            "urgency":      "NONE",
            "reason":       "Rain expected within 48 hours — irrigation skipped to prevent waterlogging.",
        }

    critical = thresholds["critical"]
    low      = thresholds["low"]

    # CRITICAL: moisture is dangerously low
    if moisture < critical:
        return {
            "irrigate":     True,
            "duration_min": 45,
            "urgency":      "CRITICAL",
            "reason": (
                f"Soil moisture ({moisture}%) is critically low for {crop} "
                f"(threshold: {critical}%). Immediate irrigation required."
            ),
        }

    # NORMAL: moisture is below the low threshold
    if moisture < low:
        return {
            "irrigate":     True,
            "duration_min": 30,
            "urgency":      "NORMAL",
            "reason": (
                f"Soil moisture ({moisture}%) is below the recommendation for {crop} "
                f"(threshold: {low}%). Schedule irrigation soon."
            ),
        }

    # NONE: moisture is adequate
    return {
        "irrigate":     False,
        "duration_min": 0,
        "urgency":      "NONE",
        "reason": (
            f"Soil moisture ({moisture}%) is adequate for {crop} "
            f"(optimal range: {thresholds['optimal']}–{thresholds['high']}%)."
        ),
    }


# ─── Nutrient Prediction ───────────────────────────────────────────────────────

def predict_nutrients(crop, npk):
    """
    Analyse NPK and pH values for a given crop against optimal ranges.

    Args:
        crop (str):  Crop name.
        npk  (dict): Keys → "N", "P", "K", "pH" with numeric values.

    Returns:
        list of dicts, one per nutrient, each with:
            nutrient   (str)   — "N" | "P" | "K" | "pH"
            value      (float) — Supplied value
            status     (str)   — "OPTIMAL" | "DEFICIENT" | "EXCESS"
            fertilizer (str)   — Recommended action / product
            dose       (str)   — Recommended dose or "N/A"
    """
    crop_lower = crop.lower()
    optimal_ranges = CROP_NPK_OPTIMAL.get(crop_lower, CROP_NPK_OPTIMAL["_default"])

    results = []

    for nutrient, value in npk.items():
        if nutrient not in optimal_ranges:
            continue  # Skip unknown nutrients

        low_opt, high_opt = optimal_ranges[nutrient]

        if value < low_opt:
            status = "DEFICIENT"
            fertilizer = FERTILIZER_MAP.get(nutrient, {}).get("deficient", "Consult agronomist")
            dose = DOSE_MAP.get(nutrient, {}).get("low", "Consult agronomist")
        elif value > high_opt:
            status = "EXCESS"
            fertilizer = FERTILIZER_MAP.get(nutrient, {}).get("excess", "Consult agronomist")
            dose = DOSE_MAP.get(nutrient, {}).get("high", "Consult agronomist")
        else:
            status = "OPTIMAL"
            fertilizer = "No action needed"
            dose = "N/A"

        results.append({
            "nutrient":   nutrient,
            "value":      value,
            "status":     status,
            "fertilizer": fertilizer,
            "dose":       dose,
        })

    return results


# ─── Demo Runner ──────────────────────────────────────────────────────────────

def run_demo():
    """
    Demonstrate irrigation and nutrient predictions with sample data.
    Simulates 4 sensor nodes for a wheat field.
    """
    crop = "wheat"
    moistures = [68, 42, 81, 23]
    npk = {"N": 42, "P": 18, "K": 65, "pH": 6.8}
    node_names = ["Node-1 (Field A)", "Node-2 (Field B)", "Node-3 (Field C)", "Node-4 (Field D)"]

    separator = "─" * 72

    # ── Irrigation Table ──────────────────────────────────────────────────
    print("\n" + separator)
    print("  AgriPulse AI — Irrigation Advisory Report")
    print(f"  Crop: {crop.capitalize()}  |  Date: 22-Mar-2026")
    print(separator)
    print(f"  {'Node':<22} {'Moisture':>10} {'Urgency':>10} {'Irrigate':>10} {'Duration':>10}")
    print(separator)

    for i, moisture in enumerate(moistures):
        result = predict_irrigation(moisture, crop, rain_expected_48h=False)
        irrigate_str = "YES ✓" if result["irrigate"] else "NO  ✗"
        duration_str = f"{result['duration_min']} min" if result["duration_min"] > 0 else "—"
        print(
            f"  {node_names[i]:<22} {moisture:>9}%  "
            f"{result['urgency']:>10}  {irrigate_str:>10}  {duration_str:>8}"
        )

    print(separator)

    # ── Detailed Reasons ──────────────────────────────────────────────────
    print("\n  Detailed Node Analysis:")
    print(separator)
    for i, moisture in enumerate(moistures):
        result = predict_irrigation(moisture, crop)
        print(f"  [{node_names[i]}]")
        print(f"    → {result['reason']}")
    print(separator)

    # ── Nutrient Analysis ─────────────────────────────────────────────────
    print("\n  NPK & pH Soil Analysis")
    print(f"  Input → N:{npk['N']}  P:{npk['P']}  K:{npk['K']}  pH:{npk['pH']}")
    print(separator)
    print(f"  {'Nutrient':<10} {'Value':>8} {'Status':>12} {'Fertilizer':<30} {'Dose'}")
    print(separator)

    nutrient_results = predict_nutrients(crop, npk)
    for nr in nutrient_results:
        print(
            f"  {nr['nutrient']:<10} {str(nr['value']):>8}  "
            f"{nr['status']:>12}  {nr['fertilizer']:<30} {nr['dose']}"
        )
    print(separator)

    # ── Marathi Voice Advisory (what would be spoken) ─────────────────────
    print("\n  Marathi Voice Advisory (spoken output simulation):")
    print(separator)

    critical_nodes = [node_names[i] for i, m in enumerate(moistures) if m < CROP_THRESHOLDS[crop]["critical"]]
    normal_nodes   = [
        node_names[i] for i, m in enumerate(moistures)
        if CROP_THRESHOLDS[crop]["critical"] <= m < CROP_THRESHOLDS[crop]["low"]
    ]
    good_nodes     = [
        node_names[i] for i, m in enumerate(moistures)
        if m >= CROP_THRESHOLDS[crop]["low"]
    ]

    marathi_lines = []

    if critical_nodes:
        nodes_str = ", ".join(critical_nodes)
        marathi_lines.append(
            f"  🔴 CRITICAL — तात्काळ पाणी द्या! ({nodes_str}) — "
            f"45 मिनिटे सिंचन आवश्यक आहे."
        )
        marathi_lines.append(
            f"     [Audio → {_audio_url_label('critical')}]"
        )

    if normal_nodes:
        nodes_str = ", ".join(normal_nodes)
        marathi_lines.append(
            f"  🟡 NORMAL  — लवकरच पाणी द्या! ({nodes_str}) — "
            f"30 मिनिटे सिंचन शिफारस केली जाते."
        )
        marathi_lines.append(
            f"     [Audio → {_audio_url_label('main')}]"
        )

    if good_nodes:
        nodes_str = ", ".join(good_nodes)
        marathi_lines.append(
            f"  🟢 ALL GOOD — सर्व ठीक आहे! ({nodes_str}) — "
            f"ओलावा पुरेसा आहे."
        )
        marathi_lines.append(
            f"     [Audio → {_audio_url_label('allgood')}]"
        )

    # Nutrient remarks in Marathi
    deficient = [nr for nr in nutrient_results if nr["status"] == "DEFICIENT"]
    if deficient:
        for nr in deficient:
            marathi_lines.append(
                f"  ⚠️  {nr['nutrient']} कमी आहे — {nr['fertilizer']} वापरा, डोस: {nr['dose']}"
            )

    for line in marathi_lines:
        print(line)

    print(separator)
    print("  [AgriPulse AI] अहवाल पूर्ण झाला. | Report complete.")
    print(separator + "\n")


def _audio_url_label(key):
    urls = {
        "main":    "https://res.cloudinary.com/dy3jinwkn/video/upload/v1774183533/Main_advisory_w8ccrj.mp3",
        "critical":"https://res.cloudinary.com/dy3jinwkn/video/upload/v1774183533/critical_b0gda5.mp3",
        "allgood": "https://res.cloudinary.com/dy3jinwkn/video/upload/v1774183533/all_good_yiwwtb.mp3",
    }
    return urls.get(key, "unknown")


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    run_demo()

import os
import json
import joblib
import pandas as pd
from flask import Flask, render_template, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "app", "templates")
STATIC_DIR = os.path.join(BASE_DIR, "app", "static")
MODELS_DIR = os.path.join(BASE_DIR, "models")

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

# Load trained models & metadata once at cold start
mlr_model = joblib.load(os.path.join(MODELS_DIR, "mlr_co2_model.joblib"))
rf_model = joblib.load(os.path.join(MODELS_DIR, "rf_co2_model.joblib"))

with open(os.path.join(MODELS_DIR, "model_metadata.json"), "r", encoding="utf-8") as f:
    METADATA = json.load(f)


def classify_eco_tier(co2_val: float) -> dict:
    """Klasifikasi status emisi CO2 kendaraan berdasarkan ambang batas g/km."""
    if co2_val < 150:
        return {
            "tier": "TIER A+ // ULTRA LOW EMISSION",
            "status": "Sangat Ramah Lingkungan",
            "level": "low",
            "advice": "Efisiensi karbon sangat tinggi (setara kendaraan Hybrid/Eco-Compact). Memenuhi standar emisi ketat Euro 6d."
        }
    elif co2_val < 210:
        return {
            "tier": "TIER B // ECO-BALANCED",
            "status": "Emisi Rendah - Moderat",
            "level": "good",
            "advice": "Keseimbangan baik antara performa mesin dan jejak karbon harian. Ideal untuk komuter perkotaan."
        }
    elif co2_val < 275:
        return {
            "tier": "TIER C // STANDARD EMITTER",
            "status": "Emisi Rata-Rata Industri",
            "level": "moderate",
            "advice": "Berada di sekitar rata-rata populasi dataset (251,2 g/km). Pertimbangkan eco-driving untuk menekan konsumsi BBM kota."
        }
    elif co2_val < 340:
        return {
            "tier": "TIER D // HIGH CARBON OUTPUT",
            "status": "Emisi Tinggi",
            "level": "high",
            "advice": "Karakteristik mesin berkapasitas besar / SUV-Pickup berat. Disarankan optimasi rute tol dan perawatan injeksi berkala."
        }
    else:
        return {
            "tier": "TIER E // EXTREME EMITTER",
            "status": "Emisi Sangat Tinggi",
            "level": "extreme",
            "advice": "Jejak karbon ekstrem (>340 g/km), tipikal mesin multi-silinder performa tinggi atau van kargo berat."
        }


@app.route("/")
def index():
    return render_template("index.html", metadata=METADATA)


@app.route("/api/metadata", methods=["GET"])
def get_metadata():
    return jsonify(METADATA)


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(force=True)

        vehicle_class = str(payload.get("vehicle_class", "COMPACT"))
        engine_size = float(payload.get("engine_size", 2.0))
        cylinders = int(payload.get("cylinders", 4))
        transmission = str(payload.get("transmission", "AS6"))
        fuel_type = str(payload.get("fuel_type", "X"))
        fuel_city = float(payload.get("fuel_city", 9.5))
        fuel_hwy = float(payload.get("fuel_hwy", 6.8))

        # Standard weighted combined rating (55% city, 45% highway per Data Description.csv)
        fuel_comb = round(0.55 * fuel_city + 0.45 * fuel_hwy, 2)
        annual_km = float(payload.get("annual_km", 15000))

        input_df = pd.DataFrame([{
            "Vehicle Class": vehicle_class,
            "Engine Size(L)": engine_size,
            "Cylinders": cylinders,
            "Transmission": transmission,
            "Fuel Type": fuel_type,
            "Fuel Consumption City (L/100 km)": fuel_city,
            "Fuel Consumption Hwy (L/100 km)": fuel_hwy,
            "Fuel Consumption Comb (L/100 km)": fuel_comb
        }])

        pred_rf = float(rf_model.predict(input_df)[0])
        pred_mlr = float(mlr_model.predict(input_df)[0])

        # Clamp non-negative physical floor
        pred_rf = max(50.0, round(pred_rf, 2))
        pred_mlr = max(50.0, round(pred_mlr, 2))

        eco_info = classify_eco_tier(pred_rf)
        annual_co2_kg = round((pred_rf * annual_km) / 1000.0, 1)
        # 1 mature tree absorbs ~21.77 kg CO2/year (USDA / EPA standard)
        trees_needed = round(annual_co2_kg / 21.77, 1)
        dataset_mean = METADATA["dataset_info"]["co2_mean"]
        diff_vs_avg_pct = round(((pred_rf - dataset_mean) / dataset_mean) * 100.0, 1)

        return jsonify({
            "success": True,
            "predictions": {
                "random_forest": pred_rf,
                "multiple_linear_regression": pred_mlr,
                "delta_models": round(abs(pred_rf - pred_mlr), 2)
            },
            "derived": {
                "fuel_comb_l100km": fuel_comb,
                "fuel_comb_mpg": round(282.481 / fuel_comb, 1) if fuel_comb > 0 else 0,
                "annual_co2_kg": annual_co2_kg,
                "trees_offset": trees_needed,
                "diff_vs_avg_pct": diff_vs_avg_pct
            },
            "eco_classification": eco_info
        })
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

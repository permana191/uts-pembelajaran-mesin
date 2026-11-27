import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT_DIR, "data", "CO2 Emissions_Canada.csv")
CLEAN_PATH = os.path.join(ROOT_DIR, "data", "co2_cleaned.csv")
MODELS_DIR = os.path.join(ROOT_DIR, "models")
CHARTS_DIR = os.path.join(ROOT_DIR, "app", "static", "charts")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(CHARTS_DIR, exist_ok=True)


def main():
    df_raw = pd.read_csv(DATA_PATH)
    print(f"[1] Dataset mentah dimuat: {df_raw.shape[0]} baris, {df_raw.shape[1]} kolom")

    # Preprocessing: Deduplikasi & eliminasi kelas minoritas tunggal Fuel Type 'N'
    df_clean = df_raw.drop_duplicates().copy()
    df_clean = df_clean[df_clean["Fuel Type"] != "N"].reset_index(drop=True)
    df_clean.to_csv(CLEAN_PATH, index=False)
    print(f"[2] Dataset bersih disimpan: {df_clean.shape[0]} baris unik")

    feature_cols = [
        "Vehicle Class", "Engine Size(L)", "Cylinders", "Transmission", "Fuel Type",
        "Fuel Consumption City (L/100 km)", "Fuel Consumption Hwy (L/100 km)",
        "Fuel Consumption Comb (L/100 km)"
    ]
    cat_features = ["Vehicle Class", "Transmission", "Fuel Type"]
    num_features = [
        "Engine Size(L)", "Cylinders",
        "Fuel Consumption City (L/100 km)", "Fuel Consumption Hwy (L/100 km)",
        "Fuel Consumption Comb (L/100 km)"
    ]

    X = df_clean[feature_cols]
    y = df_clean["CO2 Emissions(g/km)"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
        ("num", "passthrough", num_features)
    ])

    # Model 1: Multiple Linear Regression
    mlr = Pipeline([("preprocessor", preprocessor), ("regressor", LinearRegression())])
    mlr.fit(X_train, y_train)
    pred_mlr = mlr.predict(X_test)

    # Model 2: Random Forest Regressor
    rf = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=60, max_depth=16, random_state=42, n_jobs=-1))
    ])
    rf.fit(X_train, y_train)
    pred_rf = rf.predict(X_test)

    print(f"[3] MLR -> R2: {r2_score(y_test, pred_mlr):.5f} | RMSE: {np.sqrt(mean_squared_error(y_test, pred_mlr)):.3f} g/km")
    print(f"[4] RF  -> R2: {r2_score(y_test, pred_rf):.5f} | RMSE: {np.sqrt(mean_squared_error(y_test, pred_rf)):.3f} g/km")

    joblib.dump(mlr, os.path.join(MODELS_DIR, "mlr_co2_model.joblib"), compress=3)
    joblib.dump(rf, os.path.join(MODELS_DIR, "rf_co2_model.joblib"), compress=3)
    print("[5] Model .joblib terkompresi berhasil disimpan di folder models/")


if __name__ == "__main__":
    main()

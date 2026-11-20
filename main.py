
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="Old Car Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

model = joblib.load("random_forest.pkl")
car_encoder = joblib.load("Car_name_le.pkl")
fuel_encoder = joblib.load("Fuel_Type_le.pkl")
seller_encoder = joblib.load("Seller_Type_le.pkl")
transmission_encoder = joblib.load("Transmission_le.pkl")
scaler = joblib.load("scaler.pkl")


class CarData(BaseModel):
    Car_name: str
    Year: int
    KM_Driven: float
    Fuel_Type: str
    Seller_Type: str
    Transmission: str
    Owner: int
    Present_Price_Lakh: float


@app.get("/")
def home():
    return {
        "message": "Old Car Price Prediction API is working"
    }


@app.post("/predict")
def predict(data: CarData):

    try:
        car = pd.DataFrame([{
            "Car_name": car_encoder.transform([data.Car_name])[0],
            "Year": data.Year,
            "KM_Driven": data.KM_Driven,
            "Fuel_Type": fuel_encoder.transform([data.Fuel_Type])[0],
            "Seller_Type": seller_encoder.transform([data.Seller_Type])[0],
            "Transmission": transmission_encoder.transform([data.Transmission])[0],
            "Owner": data.Owner,
            "Present_Price_Lakh": data.Present_Price_Lakh
        }])

        car = car[model.feature_names_in_]

        car_scaled = pd.DataFrame(scaler.transform(car),columns=car.columns)

        prediction = model.predict(car_scaled)[0]

        prediction = model.predict(car_scaled)[0]

        return {
            "predicted_selling_price_lakh": round(float(prediction), 2),
            "currency": "INR",
            "message": "Prediction successful"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown category or invalid input: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

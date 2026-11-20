const API_URL = "http://127.0.0.1:8000/predict";

const form = document.getElementById("carForm");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const button = document.getElementById("predictBtn");

  const carData = {
    Car_name: document.getElementById("Car_name").value.trim(),
    Year: Number(document.getElementById("Year").value),
    KM_Driven: Number(document.getElementById("KM_Driven").value),
    Fuel_Type: document.getElementById("Fuel_Type").value,
    Seller_Type: document.getElementById("Seller_Type").value,
    Transmission: document.getElementById("Transmission").value,
    Owner: Number(document.getElementById("Owner").value),
    Present_Price_Lakh: Number(
      document.getElementById("Present_Price_Lakh").value,
    ),
  };

  if (
    !carData.Car_name ||
    !carData.Year ||
    carData.KM_Driven < 0 ||
    carData.Present_Price_Lakh <= 0
  ) {
    alert("Please enter valid car details.");
    return;
  }

  button.disabled = true;
  button.innerText = "Predicting...";

  document.getElementById("status").innerText = "API Status: Connecting...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    });

    const result = await response.json();

    // Backend ka actual response Console mein show hoga
    console.log("Backend Response:", result);

    if (!response.ok) {
      throw new Error(JSON.stringify(result.detail || result));
    }

    // Different possible prediction field names
    const predictedPrice =
      result.predicted_selling_price_lakh ??
      result.predicted_price ??
      result.selling_price ??
      result.prediction ??
      result.predicted_selling_price ??
      result.predicted_price_lakh ??
      result.selling_price_lakh ??
      result.price;

    if (
      predictedPrice === undefined ||
      !Number.isFinite(Number(predictedPrice))
    ) {
      document.getElementById("price").innerText = "Prediction Failed";

      document.getElementById("message").innerText =
        "Backend Response: " + JSON.stringify(result);

      document.getElementById("status").innerText =
        "API Status: Connected, but prediction field missing";

      return;
    }

    const price = Number(predictedPrice);

    document.getElementById("price").innerText =
      "₹ " + price.toFixed(2) + " Lakhs";

    document.getElementById("message").innerText =
      "Estimated Selling Price: ₹ " + (price * 100000).toLocaleString("en-IN");

    document.getElementById("status").innerHTML =
      "Model: Machine Learning<br>API Status: Connected";
  } catch (error) {
    console.error("Prediction Error:", error);

    document.getElementById("price").innerText = "Prediction Failed";

    document.getElementById("message").innerText = error.message;

    document.getElementById("status").innerText = "API Status: Error";
  } finally {
    button.disabled = false;
    button.innerText = "Predict Selling Price";
  }
});

import React, { useEffect, useState } from "react";
import Chart from "./chart";
import "../styles/global.scss"

const IndexPage = () => {
  const [temperatureIn, setTemperatureIn] = useState("");
  const [temperatureOut, setTemperatureOut] = useState("");
  const [humidityIn, setHumidityIn] = useState("");
  const [humidityOut, setHumidityOut] = useState("");
  const [steps, setSteps] = useState("");
  const [stepsPercentage, setStepsPercentage] = useState("");

  useEffect(() => {
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        console.log("Data", data)
        const percentage = Number(data.steps.replace(",", "")) / 50;

        setTemperatureIn(data.temperature_in + String.fromCharCode(176) + "F Inside");
        setTemperatureOut(data.temperature_out + String.fromCharCode(176) + "F Outside");
        setHumidityIn(data.humidity_in + "% Inside");
        setHumidityOut(data.humidity_out + "% Outside");
        setSteps(data.steps + ` (${percentage}%)`);
        setStepsPercentage(percentage.toString());
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div content="width=device-width, initial-scale=1.0">
      <h1 className="title">Dashboard</h1>
      <div className="stats-container">
        <div className="stats">
          <h2>Temperature</h2>
          <span id="temperature_in">{temperatureIn}</span>
          <span id="temperature_out">{temperatureOut}</span>
        </div>
        <div className="stats">
          <h2>Humidity</h2>
          <span id="humidity_in">{humidityIn}</span>
          <span id="humidity_out">{humidityOut}</span>
        </div>
        <div className="stats">
          <h2>Steps Today</h2>
          <span id="steps">{steps}</span>
          <span id="placeholder"></span>
        </div>
      </div>
      <div className="chart-container">
        <Chart />
      </div>
    </div>

  );
}

export default IndexPage;
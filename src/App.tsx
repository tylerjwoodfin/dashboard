import React, { useEffect, useState } from "react";
import Chart from "./chart";
import "./styles.scss";

const App: React.FC = () => {
  const [temperatureIn, setTemperatureIn] = useState<string>("");
  const [temperatureOut, setTemperatureOut] = useState<string>("");
  const [humidityIn, setHumidityIn] = useState<string>("");
  const [humidityOut, setHumidityOut] = useState<string>("");
  const [steps, setSteps] = useState<string>("");

  useEffect(() => {
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        const percentage = Number(data.steps.replace(",", "")) / 50;

        setTemperatureIn(data.temperature_in + String.fromCharCode(176) + "F Inside");
        setTemperatureOut(data.temperature_out + String.fromCharCode(176) + "F Outside");
        setHumidityIn(data.humidity_in + "% Inside");
        setHumidityOut(data.humidity_out + "% Outside");
        setSteps(data.steps + ` (${percentage}%)`);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="container">
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
};

export default App;
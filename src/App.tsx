import React, { useEffect, useState } from "react";
import Chart from "./chart";
import "./styles.scss";
import { Tab, Tabs } from "@mui/material";

const App: React.FC = () => {
  const [temperatureIn, setTemperatureIn] = useState<string>("");
  const [temperatureOut, setTemperatureOut] = useState<string>("");
  const [humidityIn, setHumidityIn] = useState<string>("");
  const [humidityOut, setHumidityOut] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [value, setValue] = useState(0);

  const styles = {
    tab: {
      active: {
        color: "#3e7"
      },
      inactive: {
        color: "#fff"
      }
    }

  }

  // Helper function to determine the color based on temperature value
  const determineTemperatureColor = (temperature: string): string => {
    const value = parseFloat(temperature);
    
    if (value < 30) {
      return "#0039e6"
    } else if (value < 40) {
      return "#00e699"
    } else if (value < 50) {
      return "#00BFFF";
    } else if (value < 60) {
      return "gray";
    } else if (value < 70) {
      return "yellow";
    } else if (value < 80) {
      return "orange";
    } else if (value < 90) {
      return "#b30000";
    } else if (value < 100) {
      return "crimson";
    } else {
      return "purple";
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
    event.preventDefault();
  };

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
          <span id="temperature_in" style={{ color: determineTemperatureColor(temperatureIn) }}
          >{temperatureIn}</span>
          <span id="temperature_out" style={{ color: determineTemperatureColor(temperatureOut) }}
          >{temperatureOut}</span>
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
      <Tabs
        value={value}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        TabIndicatorProps={{ style: { background: '#3e7' } }}
      >
        <Tab label="Temperatures" style={value === 0 ? styles.tab.active : styles.tab.inactive} />
        <Tab label="Spotify" style={value === 1 ? styles.tab.active : styles.tab.inactive} />
        <Tab label="Bedtime" style={value === 2 ? styles.tab.active : styles.tab.inactive} />
      </Tabs>
      <div className="chart-container">
        {value === 0 && <Chart />}
        {value === 1 && <Chart />}
        {value === 2 && <Chart />}
      </div>
    </div>
  );
};

export default App;
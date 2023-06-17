import React, { useEffect, useState } from "react";
import ChartWeather from "./ChartWeather";
import moment from "moment";
import "./styles.scss";
import { Tab, Tabs } from "@mui/material";
import ChartSpotify from "./ChartSpotify";
import { styled } from "@mui/system";
import ChartSleep from "./ChartSleep";
import ChartSteps from "./ChartSteps";

// Custom styles for the active and inactive tabs
const StyledTab = styled(Tab)(({ theme }) => ({
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
  "&.Mui-selected::after": {
    content: '""',
    display: "block",
    height: "3px",
    background: theme.palette.primary.main,
  },
}));

export interface IWeatherData {
  temperature: number;
  timestamp: string;
  humidity: number;
  weather_data: {
    current_conditions: string;
    current_humidity: number;
    current_temperature: number;
    tomorrow_conditions: string;
    tomorrow_high: number;
    tomorrow_low: number;
    tomorrow_sunrise: string;
    tomorrow_sunset: string;
  };
}

export const convertToTemperatureInFahrenheit = (temperature: number): number => {
  const fahrenheit = (temperature * 9) / 5 + 32;
  return Math.round(fahrenheit * 10) / 10;
};

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

const App: React.FC = () => {
  const [temperatureIn, setTemperatureIn] = useState<string>("");
  const [temperatureOut, setTemperatureOut] = useState<string>("");
  const [humidityIn, setHumidityIn] = useState<string>("");
  const [humidityOut, setHumidityOut] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [value, setValue] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const determineTemperatureColor = (temperature: string): string => {
    const value = parseFloat(temperature);

    if (value < 30) {
      return "#0039e6";
    } else if (value < 40) {
      return "#00e699";
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

  const fetchStepsData = () => {
    fetch("steps.md")
      .then((response) => response.text())
      .then((data) => {
        const steps = parseInt(data.split(" ")[0].replace(/,/g, ''), 10);
        setSteps(steps + ` (${steps / 50}%)`);
      })
      .catch((error) => console.error("Error fetching steps data:", error));
  };

  const fetchWeatherData = () => {
    const today = moment().format("YYYY-MM-DD");
    fetch(`weather/weather ${today}.json`)
      .then((response) => response.text())
      .then((text) => {
        const data = JSON.parse(`[${text.slice(0, -1)}]`);
        const weatherData: IWeatherData = data[data.length - 1];

        setTemperatureIn(
          convertToTemperatureInFahrenheit(weatherData.temperature) +
          String.fromCharCode(176) +
          "F Inside"
        );
        setTemperatureOut(
          convertToTemperatureInFahrenheit(weatherData.weather_data.current_temperature - 273.15) +
          String.fromCharCode(176) +
          "F Outside"
        );
        setHumidityIn(
          Math.round(weatherData.humidity * 10) / 10 + "% Inside"
        );
        setHumidityOut(weatherData.weather_data.current_humidity + "% Outside");

        setUpdatedAt(moment().format('YYYY-MM-DD hh:mm:ss A'))
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  useEffect(() => {
    fetchStepsData();
    fetchWeatherData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <h3 className="dashboard-updated">(<span className="dashboard-updated date">{updatedAt}</span>)</h3>
      <div className="stats-container">
        <div className="stat">
          <h2>Temperature</h2>
          <span
            id="temperature_in"
            style={{ color: determineTemperatureColor(temperatureIn) }}
          >
            {temperatureIn}
          </span>
          <span
            id="temperature_out"
            style={{ color: determineTemperatureColor(temperatureOut) }}
          >
            {temperatureOut}
          </span>
        </div>
        <div className="stat">
          <h2>Humidity</h2>
          <span id="humidity_in">{humidityIn}</span>
          <span id="humidity_out">{humidityOut}</span>
        </div>
        <div className="stat">
          <h2>Steps Today</h2>
          <span id="steps">{steps}</span>
        </div>
      </div>
      <Tabs
        value={value}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        TabIndicatorProps={{ style: { background: "#3e7" } }}
      >
        <Tab
          label="Temperatures"
          style={value === 0 ? styles.tab.active : styles.tab.inactive}
        />
        <Tab
          label="Spotify"
          style={value === 1 ? styles.tab.active : styles.tab.inactive}
        />
        <Tab
          label="Sleep"
          style={value === 2 ? styles.tab.active : styles.tab.inactive}
        />
        <Tab
          label="Steps"
          style={value === 3 ? styles.tab.active : styles.tab.inactive}
        />
      </Tabs>
      <div className="chart-container">
        {value === 0 && <ChartWeather />}
        {value === 1 && <ChartSpotify />}
        {value === 2 && <ChartSleep />}
        {value === 3 && <ChartSteps />}
      </div>
    </div>
  );
};

export default App;
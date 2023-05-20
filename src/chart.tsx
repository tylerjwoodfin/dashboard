import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { Layout } from "plotly.js";
import { IWeatherData, convertToTemperatureInFahrenheit } from "./App"

const Chart: React.FC = () => {
  const [data, setData] = useState<IWeatherData[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(0);

  useEffect(() => {
    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    const dayBeforeYesterday = moment().subtract(2, "day").format("YYYY-MM-DD");

    // chart width
    const calculateChartWidth = () => {
      const screenWidth = window.innerWidth;
      const desiredWidth = screenWidth < 768 ? screenWidth * 0.9 : screenWidth * 0.65;
      setChartWidth(desiredWidth);
    };

    calculateChartWidth();

    // Update chart width on window resize
    const handleResize = () => {
      calculateChartWidth();
    };

    window.addEventListener('resize', handleResize);

    const fetchData = async () => {
      try {
        const [todayResponse, yesterdayResponse, dayBeforeYesterdayResponse] = await Promise.all([
          fetch(`weather/weather ${today}.json`),
          fetch(`weather/weather ${yesterday}.json`),
          fetch(`weather/weather ${dayBeforeYesterday}.json`)
        ]);

        const [todayText, yesterdayText, dayBeforeYesterdayText] = await Promise.all([
          todayResponse.text(),
          yesterdayResponse.text(),
          dayBeforeYesterdayResponse.text()
        ]);

        const parsedData = [todayText, yesterdayText, dayBeforeYesterdayText].map(text => JSON.parse(`[${text.slice(0, -1)}]`));
        const combinedData = [].concat(...parsedData);
        combinedData.sort((a, b) => moment(a['timestamp']).diff(moment(b['timestamp'])));
        setData(combinedData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const thirtySixHoursAgo = moment().subtract(36, "hours");
  const timestamps: Date[] = [];
  const temperaturesIndoorCelsius: number[] = [];
  const temperaturesOutdoorKelvin: number[] = [];
  const humidities: number[] = [];

  for (const obs of data) {
    const ts = moment(obs['timestamp']);
    if (ts.isSameOrAfter(thirtySixHoursAgo)) {
      timestamps.push(ts.toDate());
      temperaturesIndoorCelsius.push(obs.temperature);
      temperaturesOutdoorKelvin.push(obs.weather_data?.current_temperature);
      humidities.push(obs.humidity);
    }
  }

  const temperaturesIndoorFahrenheit = temperaturesIndoorCelsius.map(convertToTemperatureInFahrenheit);
  const temperaturesOutdoorFahrenheit = temperaturesOutdoorKelvin.map((temp) => convertToTemperatureInFahrenheit(temp - 273.15));

  const trace1 = {
    x: timestamps,
    y: temperaturesIndoorFahrenheit.map((temp) => Number(temp)), // convert to number type
    name: "Indoor Temperature (F)",
    yaxis: "y1",
  };

  const trace2 = {
    x: timestamps,
    y: temperaturesOutdoorFahrenheit.map((temp) => Number(temp)), // convert to number type
    name: "Outdoor Temperature (F)",
    yaxis: "y1",
  };

  const layout: Partial<Layout> = {
    title: "Temperatures, Past 36 Hours",
    plot_bgcolor: "#1f1f1f",
    font: {
      color: "white"
    },
    paper_bgcolor: "#1f1f1f",
    xaxis: { title: "Time" },
    yaxis: { title: "Temperature (Fahrenheit)", side: "right", autorange: true, fixedrange: true },
    autosize: true,
    width: chartWidth,
    legend: { y: 1.15, orientation: "h" },
  };

  return <Plot data={[trace1, trace2]} layout={layout} />;
};

export default Chart;

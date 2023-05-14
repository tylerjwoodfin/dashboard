import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { Layout } from "plotly.js";

const MyPlot: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    const dayBeforeYesterday = moment().subtract(2, "day").format("YYYY-MM-DD");

    Promise.all([
      fetch(`weather/weather ${today}.json`),
      fetch(`weather/weather ${yesterday}.json`),
      fetch(`weather/weather ${dayBeforeYesterday}.json`)
    ])
      .then((responses) => {
        return Promise.all(responses.map(response => response.text()));
      })
      .then((texts) => {
        const parsedData = texts.map(text => JSON.parse(`[${text.slice(0, -1)}]`));
        const combinedData = [].concat(...parsedData);
        combinedData.sort((a, b) => moment(a['timestamp']).diff(moment(b['timestamp'])));
        setData(combinedData);
      });
  }, []);

  const thirty_six_hours_ago = moment().subtract(36, "hours");
  const timestamps: Date[] = [];
  const temperatures_indoor_celsius: number[] = [];
  const temperatures_outdoor_kelvin: number[] = [];
  const humidities: number[] = [];

  for (const obs of data) {
    const ts = moment(obs.timestamp);
    if (ts >= thirty_six_hours_ago) {
      timestamps.push(ts.toDate());
      temperatures_indoor_celsius.push(obs.temperature);
      temperatures_outdoor_kelvin.push(obs.weather_data?.current_temperature)
      humidities.push(obs.humidity);
    }
  }

  // Convert Celsius to Fahrenheit
  const temperatures_indoor_fahrenheit = temperatures_indoor_celsius.map(
    (temp) => temp * 1.8 + 32
  );

  const temperatures_outdoor_fahrenheit = temperatures_outdoor_kelvin.map(
    (temp) => (temp - 273.15) * 1.8 + 32
  );

  // Create traces
  const trace1 = {
    x: timestamps,
    y: temperatures_indoor_fahrenheit.map((temp) => Number(temp)), // convert to number type
    name: "Indoor Temperature (F)",
    yaxis: "y1",
  };

  const trace2 = {
    x: timestamps,
    y: temperatures_outdoor_fahrenheit.map((temp) => Number(temp)), // convert to number type
    name: "Outdoor Temperature (F)",
    yaxis: "y1",
  };

  // Set layout
  const layout: Partial<Layout> = {
    title: "Temperatures, Past 36 Hours",
    plot_bgcolor: "#1f1f1f",
    font: {
      color: "white"
    },
    paper_bgcolor: "#1f1f1f",
    xaxis: { title: "Time" },
    yaxis: {
      title: "Temperature (F)",
      side: "right",
      autorange: true,
      fixedrange: true,
    },
    autosize: true,
    legend: { y: 1.15, orientation: "h" },
  };

  return <Plot data={[trace1, trace2]} layout={layout} />;
};

export default MyPlot;

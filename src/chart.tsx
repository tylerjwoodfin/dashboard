import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { Layout } from "plotly.js";

const MyPlot: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const today = moment().format("YYYY-MM-DD");

  useEffect(() => {
    fetch(`weather/weather ${today}.json`)
      .then((response) => response.text())
      .then((text) => {
        const parsedData = JSON.parse(`[${text.slice(0, -1)}]`);
        setData(parsedData);
      });
  }, []);

  const thirty_six_hours_ago = moment().subtract(36, "hours");
  const timestamps: Date[] = [];
  const temperatures_celsius: number[] = [];
  const humidities: number[] = [];

  for (const obs of data) {
    const ts = moment(obs.timestamp);
    if (ts >= thirty_six_hours_ago) {
      timestamps.push(ts.toDate());
      temperatures_celsius.push(obs.temperature);
      humidities.push(obs.humidity);
    }
  }

  // Convert Celsius to Fahrenheit
  const temperatures_fahrenheit = temperatures_celsius.map(
    (temp) => temp * 1.8 + 32
  );

  // Create traces
  const trace1 = {
    x: timestamps,
    y: temperatures_fahrenheit.map((temp) => Number(temp)), // convert to number type
    name: "Temperature (Fahrenheit)",
    yaxis: "y1",
  };

  const trace2 = {
    x: timestamps,
    y: humidities.map((humidity) => Number(humidity)), // convert to number type
    name: "Humidity",
    yaxis: "y2",
  };

  // Set layout
  const layout: Partial<Layout> = {
    title: "Temperature and Humidity, Past 36 Hours",
    xaxis: { title: "Time" },
    yaxis: {
      title: "Temperature (F)",
      side: "right",
      autorange: true,
      fixedrange: true,
    },
    yaxis2: {
      title: "Humidity (%)",
      side: "left",
      overlaying: "y",
      autorange: true,
      fixedrange: true,
    },
    autosize: true,
    legend: { y: 1, orientation: "h" },
  };

  return <Plot data={[trace1, trace2]} layout={layout} />;
};

export default MyPlot;

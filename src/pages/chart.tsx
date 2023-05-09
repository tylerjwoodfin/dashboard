import React, { useState, useEffect } from "react"
import Plot from "react-plotly.js"
import moment from "moment";

const MyPlot = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('weather 2023-05-08.json')
      .then(response => response.text())
      .then(text => {
        const parsedData = JSON.parse(`[${text.slice(0,-1)}]`);
        setData(parsedData);
      });
  }, []);  

  const thirty_six_hours_ago = moment().subtract(36, 'hours');
  const timestamps = [];
  const temperatures_celsius = [];
  const humidities = [];

  for (const obs of data as any) {
    const ts = moment(obs.timestamp);
    if (ts >= thirty_six_hours_ago) {
      timestamps.push(ts);
      temperatures_celsius.push(obs.temperature);
      humidities.push(obs.humidity);
    }
  }

  // Convert Celsius to Fahrenheit
  const temperatures_fahrenheit = temperatures_celsius.map(temp => (temp * 1.8) + 32);

  // Convert timestamps to local timezone
  const timestamps_local = timestamps.map(ts => ts.local().toDate());

  // Create traces
  const trace1 = {
    x: timestamps_local,
    y: temperatures_fahrenheit,
    name: 'Temperature (Fahrenheit)',
    yaxis: 'y1',
    type: 'scatter',
  };

  const trace2 = {
    x: timestamps_local,
    y: humidities,
    name: 'Humidity',
    yaxis: 'y2',
    type: 'scatter',
  };

  // Set layout
  const layout = {
    title: 'Temperature and Humidity, Past 36 Hours',
    xaxis: { title: 'Time' },
    yaxis: {
      title: 'Temperature (F)',
      side: 'right',
      autorange: true,
      fixedrange: true,
    },
    yaxis2: {
      title: 'Humidity (%)',
      side: 'left',
      overlaying: 'y',
      autorange: true,
      fixedrange: true,
    },
    autosize: true,
    legend: { y: 1, orientation: 'h' },
  };

  return <Plot data={[trace1, trace2]} layout={layout} />;
};


export default MyPlot
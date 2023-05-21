import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { Layout } from "plotly.js";

const ChartSpotify: React.FC = () => {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartType, setChartType] = useState<"daily" | "weekly" | "monthly">("weekly");

  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    marginRight: "8px",
    color: "white",
    background: "transparent",
    cursor: "pointer",
    outline: "none",
    // Add more styles as desired
  };


  useEffect(() => {
    const calculateChartWidth = () => {
      const screenWidth = window.innerWidth;
      const desiredWidth = screenWidth < 768 ? screenWidth * 0.9 : screenWidth * 0.65;
      setChartWidth(desiredWidth);
    };

    calculateChartWidth();

    const handleResize = () => {
      calculateChartWidth();
    };

    window.addEventListener("resize", handleResize);

    const fetchData = async () => {
      try {
        const response = await fetch(`SPOTIPY_AVERAGE_YEAR_LOG.log`);
        const logText = await response.text();
        const lines = logText.split("\n");

        const filteredData = lines
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const parts = line.split(",");
            const date = moment(parts[0].trim()).format("YYYY-MM-DD");
            const value = Number(parts[parts.length - 1].trim());
            return { date, value };
          });

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching Spotify data:", error);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredData = getFilteredData();

  function getFilteredData() {
    const thirtyDaysAgo = moment().subtract(30, "days");
    const fiftyTwoWeeksAgo = moment().subtract(52, "weeks");

    switch (chartType) {
      case "daily":
        return data.filter((entry) => moment(entry.date).isSameOrAfter(thirtyDaysAgo));
      case "weekly":
        return data.filter((entry) => moment(entry.date).isSameOrAfter(fiftyTwoWeeksAgo));
      case "monthly":
        const monthlyData: { date: string; value: number }[] = [];
        const monthlyMap = new Map<string, number[]>();

        for (const entry of data) {
          const month = moment(entry.date).format("YYYY-MM");

          if (!monthlyMap.has(month)) {
            monthlyMap.set(month, [entry.value]);
          } else {
            monthlyMap.get(month)?.push(entry.value);
          }
        }

        monthlyMap.forEach((values, month) => {
          const averageValue =
            values.reduce((sum, value) => sum + value, 0) / values.length;
          monthlyData.push({ date: month, value: averageValue });
        });

        return monthlyData;
      default:
        return [];
    }
  }

  const timestamps = filteredData.map((entry) => entry.date);
  const values = filteredData.map((entry) => entry.value);

  const trace = {
    x: timestamps,
    y: values,
    mode: "lines",
    name: "Spotify Tracks",
    yaxis: "y1",
  };

  const layout: Partial<Layout> = {
    title: "Spotify Tracks Over Time",
    plot_bgcolor: "#1f1f1f",
    font: {
      color: "white",
    },
    paper_bgcolor: "#1f1f1f",
    xaxis: { title: "Date" },
    yaxis: { title: "Average Year", side: "right", autorange: true, fixedrange: true, tickformat: ".2f" },
    autosize: true,
    width: chartWidth,
    legend: { y: 1.15, orientation: "h" },
  };

  return (
    <div>
      <div className="button-group">
        <button
          style={{
            ...buttonStyle,
            background: chartType === "daily" ? "rgba(255, 255, 255, 0.2)" : "transparent",
          }}
          onClick={() => setChartType("daily")}
        >
          Daily
        </button>
        <button
          style={{
            ...buttonStyle,
            background: chartType === "weekly" ? "rgba(255, 255, 255, 0.2)" : "transparent",
          }}
          onClick={() => setChartType("weekly")}
        >
          Weekly
        </button>
        <button
          style={{
            ...buttonStyle,
            background: chartType === "monthly" ? "rgba(255, 255, 255, 0.2)" : "transparent",
          }}
          onClick={() => setChartType("monthly")}
        >
          Monthly
        </button>
      </div>
      <Plot data={[trace]} layout={layout} />
    </div>
  );
};

export default ChartSpotify;

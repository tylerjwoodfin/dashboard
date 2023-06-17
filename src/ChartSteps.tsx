import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { Layout } from "plotly.js";

const ChartSteps: React.FC = () => {
    const [data, setData] = useState<{ date: string; steps: number }[]>([]);
    const [chartWidth, setChartWidth] = useState<number>(0);
    const [chartType, setChartType] = useState<"daily" | "weekly" | "monthly">(
        "daily"
    );

    const buttonStyle = {
        padding: "8px 16px",
        border: "none",
        borderRadius: "4px",
        marginRight: "8px",
        color: "white",
        background: "transparent",
        cursor: "pointer",
        outline: "none",
    };

    const formatData = (csvData: string): { date: string; steps: number }[] => {
        try {
            const lines = csvData.trim().split("\n");
            return lines.map((line) => {
                const [date, steps] = line.split(",");
                return { date, steps: parseInt(steps) };
            });
        } catch (error) {
            console.error("Error parsing CSV data:", error);
            return [];
        }
    };

    const isWeekend = (dateString: string) => {
        const date = moment(dateString, "ddd<br>MM/DD");
        const dayOfWeek = date.day();
        return dayOfWeek === 6 || dayOfWeek === 0; // Saturday is 6, Sunday is 0
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
                const response = await fetch("log_steps.csv");
                const csvData = await response.text();
                const formattedData = formatData(csvData);
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching steps data:", error);
            }
        };

        fetchData();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const getFilteredData = () => {
        let filteredData: { date: string; steps: number }[] = [];

        switch (chartType) {
            case "daily":
                filteredData = data.slice(-7);
                break;
            case "weekly":
                filteredData = aggregateWeeklyData();
                break;
            case "monthly":
                filteredData = aggregateMonthlyData();
                break;
            default:
                filteredData = data;
                break;
        }

        return filteredData;
    };


    const aggregateWeeklyData = () => {
        const weeklyData: { date: string; steps: number }[] = [];
        let currentWeekData: { date: string; steps: number }[] = [];
        let currentDate: moment.Moment | null = null;

        data.forEach((entry) => {
            const entryDate = moment(entry.date);
            if (!currentDate) {
                currentDate = entryDate;
            }

            if (entryDate.isSame(currentDate, "week")) {
                currentWeekData.push(entry);
            } else {
                const averageSteps = calculateAverageSteps(currentWeekData);
                const weekStartDate = currentDate.clone().startOf("week").format("YYYY-MM-DD");
                weeklyData.push({ date: weekStartDate, steps: averageSteps });

                currentDate = entryDate;
                currentWeekData = [entry];
            }
        });

        if (currentWeekData.length > 0) {
            const averageSteps = calculateAverageSteps(currentWeekData);
            const weekStartDate = currentDate!.clone().startOf("week").format("YYYY-MM-DD");
            weeklyData.push({ date: weekStartDate, steps: averageSteps });
        }

        return weeklyData;
    };

    const aggregateMonthlyData = () => {
        const monthlyData: { date: string; steps: number }[] = [];
        let currentMonthData: { date: string; steps: number }[] = [];
        let currentDate: moment.Moment | null = null;

        data.forEach((entry) => {
            const entryDate = moment(entry.date);
            if (!currentDate) {
                currentDate = entryDate;
            }

            if (entryDate.isSame(currentDate, "month")) {
                currentMonthData.push(entry);
            } else {
                const averageSteps = calculateAverageSteps(currentMonthData);
                const monthStartDate = currentDate.clone().startOf("month").format("YYYY-MM-DD");
                monthlyData.push({ date: monthStartDate, steps: averageSteps });

                currentDate = entryDate;
                currentMonthData = [entry];
            }
        });

        if (currentMonthData.length > 0) {
            const averageSteps = calculateAverageSteps(currentMonthData);
            const monthStartDate = currentDate!.clone().startOf("month").format("YYYY-MM-DD");
            monthlyData.push({ date: monthStartDate, steps: averageSteps });
        }

        return monthlyData;
    };

    const calculateAverageSteps = (data: { date: string; steps: number }[]) => {
        const totalSteps = data.reduce((sum, entry) => sum + entry.steps, 0);
        return Math.round(totalSteps / data.length);
    };

    const chartData = getFilteredData();

    const dates = chartData.map((entry) => entry.date);
    const steps = chartData.map((entry) => entry.steps);

    const layout: Partial<Layout> = {
        title: "Steps Over Time",
        plot_bgcolor: "#1f1f1f",
        font: {
            color: "white",
        },
        paper_bgcolor: "#1f1f1f",
        xaxis: { title: "Date", tickmode: 'auto', nticks: 10, range: [dates[0], dates[dates.length - 1]], },
        yaxis: {
            title: "Steps",
            side: "right",
            autorange: true,
            fixedrange: false,
            automargin: true,
            tickmode: "array",
            tickvals: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000],
        },
        autosize: true,
        width: chartWidth,
        legend: { y: 1.15, orientation: "h" },
        barmode: "stack",
        shapes: dates.map((date, index) => {
            return {
                type: "rect",
                xref: "x",
                yref: "paper",
                x0: index - 0.5,
                x1: index + 0.5,
                y0: 0,
                y1: 1,
                fillcolor: isWeekend(date) ? '#6A1B9A' : '#1f1f1f',
                opacity: 0.2,
                line: {
                    width: 0,
                },
            };
        }),
    };

    const stepsTrace: Partial<Plotly.BoxPlotData> = {
        x: dates,
        y: steps,
        mode: "lines+markers",
        name: "Steps",
        yaxis: "y",
        hovertemplate: "Date: %{x}<br>Steps: %{y}",
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
            <Plot
                data={[stepsTrace]}
                layout={layout}
            />
        </div>
    );
};

export default ChartSteps;

import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { Layout } from "plotly.js";

const ChartBedtime: React.FC = () => {
    const [data, setData] = useState<{ [date: string]: { bedtime: string; wakeup: string } }[]>([]);
    const [chartWidth, setChartWidth] = useState<number>(0);
    const [chartType, setChartType] = useState<"daily" | "weekly" | "monthly">("daily");

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

    const formatData = (csvData: string): { [date: string]: { bedtime: string; wakeup: string } }[] => {
        try {
            const lines = csvData.trim().split("\n");
            const headers = lines[0].split(",");
            const bedtimeIndex = headers.indexOf("time\r");
            const typeIndex = headers.indexOf("bedtime");
            const dateIndex = headers.indexOf("date");

            const result: { [date: string]: { bedtime: string; wakeup: string } } = {};

            lines.slice(1).forEach((line) => {
                const values = line.split(",");
                const bedtime = values[bedtimeIndex].trim();
                const type = values[typeIndex].trim();
                const date = values[dateIndex].trim();

                if (!result[date]) {
                    result[date] = { bedtime: "", wakeup: "" };
                }

                if (type === "bedtime") {
                    result[date].bedtime = bedtime;
                } else if (type === "wakeup") {
                    result[date].wakeup = bedtime;
                }
            });

            return Object.entries(result).map(([date, { bedtime, wakeup }]) => ({ [date]: { bedtime, wakeup } }));
        } catch (error) {
            console.error("Error parsing CSV data:", error);
            return [];
        }
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
                const response = await fetch("log_bedtime.csv");
                const csvData = await response.text();
                const formattedData = formatData(csvData);
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching bedtime data:", error);
            }
        };

        fetchData();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    const filteredData = getFilteredData();

    function getFilteredData() {
        const sevenDaysAgo = moment().subtract(7, "days");
        const fiftyTwoWeeksAgo = moment().subtract(52, "weeks");
        const twelveMonthsAgo = moment().subtract(12, "months");

        switch (chartType) {
            case "daily":
                return data.filter((entry) => moment(Object.keys(entry)[0]).isSameOrAfter(sevenDaysAgo));
            case "weekly":
                return data.filter((entry) => moment(Object.keys(entry)[0]).isSameOrAfter(fiftyTwoWeeksAgo));
            case "monthly":
                const monthlyData: { [date: string]: { bedtime: string; wakeup: string } }[] = [];
                const monthlyMap = new Map<string, string[]>();

                for (const entry of data) {
                    const month = moment(Object.values(entry)[0].wakeup).format("YYYY-MM");

                    if (!monthlyMap.has(month)) {
                        monthlyMap.set(month, [Object.values(entry)[0].wakeup]);
                    } else {
                        monthlyMap.get(month)?.push(Object.values(entry)[0].wakeup);
                    }
                }

                monthlyMap.forEach((values, month) => {
                    const averageValue =
                        values.reduce((sum, value) => sum + moment.duration(value).asMinutes(), 0) /
                        values.length;
                    const formattedBedtime = moment.utc().startOf("day").add(averageValue, "minutes").format("HH:mm");

                    monthlyData.push({ [month]: { bedtime: formattedBedtime, wakeup: "" } });
                });

                return monthlyData;
            default:
                return [];
        }
    }


    const timestamps = filteredData.map((entry) => moment(Object.keys(entry)[0]).format("ddd<br>MM/DD"));
    const bedtimes = filteredData.map((entry) => {
        const time = moment(Object.values(entry)[0].bedtime, "HH:mm");
        const decimalTime = time.hours() + time.minutes() / 60;
        return decimalTime;
    });

    const wakeups = filteredData.map((entry) => {
        const time = moment(Object.values(entry)[0].wakeup, "HH:mm");
        const decimalTime = time.hours() + time.minutes() / 60;
        return decimalTime;
    });

    const formatTime = (time: any) => {
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60).toString().padStart(2, '0');
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    const bedtimeTrace = {
        x: timestamps,
        y: bedtimes,
        mode: "lines+markers",
        name: "Bedtime",
        yaxis: "y1",
        hovertemplate: "%{x}<br>Bedtime: %{customdata}",
        customdata: bedtimes.map(formatTime),
    };

    const wakeupTrace = {
        x: timestamps,
        y: wakeups,
        mode: "lines+markers",
        name: "Wakeup",
        yaxis: "y1",
        hovertemplate: "%{x}<br>Wakeup: %{customdata}",
        customdata: wakeups.map(formatTime),
    };


    const layout: Partial<Layout> = {
        title: "Bedtime and Wakeup Over Time",
        plot_bgcolor: "#1f1f1f",
        font: {
            color: "white",
        },
        paper_bgcolor: "#1f1f1f",
        xaxis: { title: "Date" },
        yaxis: {
            title: "Time",
            side: "right",
            autorange: true,
            fixedrange: false,
            tickformat: "%H:%M",
            tickmode: "array",
            tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            ticktext: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
        },
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
            <Plot
                data={[bedtimeTrace, wakeupTrace]}
                layout={layout}
            />
        </div>
    );
};

export default ChartBedtime;

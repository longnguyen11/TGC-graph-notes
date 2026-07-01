"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";

import {
  buildFpsSeries,
  buildUserSummaries,
  formatGraphTooltip,
  formatTimestamp,
  getAverageFps,
  getRecentEvents,
  getTimestampRange,
  type ChartSeries,
  type FeedEvent,
} from "@/lib/graph";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const testData: FeedEvent[] = [
  {
    id: 0,
    user: "david",
    fps: 25,
    timestamp: 1652827090,
    event: "item_purchase",
    description: "season_pass",
  },
  {
    id: 1,
    user: "david",
    fps: 25,
    timestamp: 1652827000,
    event: "item_purchase",
    description: "candle",
  },
  {
    id: 2,
    user: "david",
    fps: 30,
    timestamp: 1652827420,
    event: "add_friend",
    description: "James",
  },
  {
    id: 3,
    user: "david",
    fps: 29,
    timestamp: 1652827400,
    event: "enter_level",
    description: "Level_Archives",
  },
  {
    id: 4,
    user: "david",
    fps: 31,
    timestamp: 1652827060,
    event: "ping",
    description: "",
  },
  {
    id: 5,
    user: "david",
    fps: 29,
    timestamp: 1652827160,
    event: "enter_level",
    description: "Level_Rain",
  },
  {
    id: 6,
    user: "david",
    fps: 27,
    timestamp: 1652827480,
    event: "ping",
    description: "",
  },
  {
    id: 7,
    user: "david",
    fps: 30,
    timestamp: 1652827300,
    event: "ping",
    description: "",
  },
  {
    id: 8,
    user: "david",
    fps: 25,
    timestamp: 1652827320,
    event: "item_purchase",
    description: "candle",
  },
  {
    id: 9,
    user: "david",
    fps: 30,
    timestamp: 1652827425,
    event: "add_party",
    description: "James",
  },
  {
    id: 10,
    user: "James",
    fps: 60,
    timestamp: 1652827425,
    event: "add_party",
    description: "david",
  },
  {
    id: 11,
    user: "James",
    fps: 59,
    timestamp: 1652827500,
    event: "ping",
    description: "",
  },
];

export default function Graph() {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  const series = useMemo(() => buildFpsSeries(testData), []);
  const userSummaries = useMemo(() => buildUserSummaries(testData), []);
  const recentEvents = useMemo(() => getRecentEvents(testData), []);
  const averageFps = useMemo(() => getAverageFps(testData), []);
  const { firstTimestamp, lastTimestamp } = getTimestampRange(testData);

  const option = useMemo<EChartsOption>(
    () => ({
      backgroundColor: "transparent",
      grid: {
        left: 8,
        right: 18,
        top: 28,
        bottom: 58,
        containLabel: true,
      },
      legend: {
        show: false,
        selected: selectedUsers,
      },
      dataZoom: [
        {
          type: "inside",
          filterMode: "none",
        },
        {
          type: "slider",
          bottom: 10,
          height: 20,
          borderColor: "transparent",
          backgroundColor: "rgba(199, 210, 204, 0.08)",
          fillerColor: "rgba(110, 231, 183, 0.16)",
          handleStyle: {
            color: "#6ee7b7",
            borderColor: "#6ee7b7",
          },
          textStyle: {
            color: "#9ca7a1",
          },
        },
      ],
      tooltip: {
        trigger: "axis",
        confine: true,
        backgroundColor: "rgba(18, 22, 21, 0.96)",
        borderColor: "rgba(199, 210, 204, 0.18)",
        borderWidth: 1,
        padding: [10, 12],
        textStyle: {
          color: "#edf2ee",
          fontSize: 12,
        },
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "rgba(199, 210, 204, 0.45)",
            width: 1,
          },
        },
        formatter: formatGraphTooltip,
      },
      xAxis: {
        type: "time",
        axisLabel: {
          color: "#9ca7a1",
          hideOverlap: true,
        },
        axisLine: {
          lineStyle: {
            color: "rgba(199, 210, 204, 0.14)",
          },
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        name: "FPS",
        nameTextStyle: {
          color: "#9ca7a1",
        },
        scale: true,
        axisLabel: {
          color: "#9ca7a1",
          formatter: "{value}",
        },
        splitLine: {
          lineStyle: {
            color: "rgba(199, 210, 204, 0.12)",
          },
        },
      },
      series: series.map((item: ChartSeries) => ({
        type: "line",
        id: item.user,
        name: item.user,
        data: item.points,
        step: "end",
        symbol: "circle",
        symbolSize: 7,
        showSymbol: true,
        itemStyle: {
          color: item.color,
        },
        lineStyle: {
          color: item.color,
          width: 2.5,
          shadowBlur: 8,
          shadowColor: "rgba(0, 0, 0, 0.48)",
          shadowOffsetY: 2,
        },
        emphasis: {
          focus: "series",
        },
      })),
    }),
    [selectedUsers, series],
  );

  function toggleUser(user: string) {
    setSelectedUsers((current) => ({
      ...current,
      [user]: current[user] === false,
    }));
  }

  function showAllUsers() {
    setSelectedUsers(Object.fromEntries(series.map((item) => [item.user, true])));
  }

  function invertUsers() {
    setSelectedUsers((current) =>
      Object.fromEntries(
        series.map((item) => [item.user, current[item.user] === false]),
      ),
    );
  }

  return (
    <main className="page">
      <section className="page-header">
        <span className="eyebrow">Graph</span>
        <h1 className="page-title">FPS over time by user.</h1>
        <p className="page-copy">
          A line graph of the provided test data. Hover a point to inspect the
          full source event.
        </p>
      </section>

      <section className="metric-row" aria-label="Graph summary">
        <div className="metric">
          <span>Users</span>
          <strong>{series.length}</strong>
        </div>
        <div className="metric">
          <span>Events</span>
          <strong>{testData.length}</strong>
        </div>
        <div className="metric">
          <span>Average FPS</span>
          <strong>{averageFps}</strong>
        </div>
      </section>

      <section className="panel chart-panel">
        <div className="chart-header">
          <div>
            <h2>Session performance</h2>
            <p>
              {formatTimestamp(firstTimestamp)} to {formatTimestamp(lastTimestamp)}
            </p>
          </div>
          <div className="nav-links" aria-label="Legend actions">
            <button className="ghost-button" type="button" onClick={showAllUsers}>
              All
            </button>
            <button className="ghost-button" type="button" onClick={invertUsers}>
              Invert
            </button>
          </div>
        </div>

        <ReactECharts
          className="chart-canvas"
          option={option}
          lazyUpdate
          opts={{ renderer: "canvas" }}
          style={{ height: 460, width: "100%" }}
        />

        <div className="chart-legend" aria-label="User visibility">
          {series.map((item) => {
            const isSelected = selectedUsers[item.user] !== false;

            return (
              <button
                aria-pressed={isSelected}
                className="legend-pill"
                key={item.user}
                onClick={() => toggleUser(item.user)}
                style={{
                  borderColor: isSelected ? item.color : undefined,
                  color: isSelected ? item.color : undefined,
                }}
                type="button"
              >
                <span
                  className="legend-dot"
                  style={{
                    backgroundColor: item.color,
                    opacity: isSelected ? 1 : 0.35,
                  }}
                />
                {item.user}
              </button>
            );
          })}
        </div>
      </section>

      <section className="graph-insights" aria-label="Graph details">
        <div className="panel">
          <div className="panel-title">
            <h2>User breakdown</h2>
            <span>FPS range</span>
          </div>

          <div className="summary-list">
            {userSummaries.map((summary) => (
              <article className="summary-row" key={summary.user}>
                <div className="summary-user">
                  <span
                    className="summary-dot"
                    style={{ backgroundColor: summary.color }}
                  />
                  <div>
                    <strong>{summary.user}</strong>
                    <span>{summary.eventCount} events</span>
                  </div>
                </div>

                <div className="summary-stats">
                  <span className="summary-stat">
                    <strong>{summary.averageFps}</strong>
                    avg
                  </span>
                  <span className="summary-stat">
                    <strong>{summary.minFps}</strong>
                    min
                  </span>
                  <span className="summary-stat">
                    <strong>{summary.maxFps}</strong>
                    max
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Recent events</h2>
            <span>{recentEvents.length} latest</span>
          </div>

          <div className="event-list">
            {recentEvents.map((event) => (
              <article className="event-row" key={event.id}>
                <header>
                  <div>
                    <strong>{event.event}</strong>
                    <span>
                      {event.user} - {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <span className="event-fps">{event.fps} fps</span>
                </header>

                <p>{event.description || "No description"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

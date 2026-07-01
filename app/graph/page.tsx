"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type FeedEvent = {
  id: number;
  user: string;
  fps: number;
  timestamp: number;
  event: string;
  description: string;
};

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

const colors = ["#6ee7b7", "#f5c867", "#f08a70", "#60a5fa", "#c084fc"];

type ChartPoint = {
  value: [number, number];
  event: FeedEvent;
};

type ChartSeries = {
  user: string;
  color: string;
  points: ChartPoint[];
};

type TooltipParam = {
  color?: string;
  seriesName?: string;
  data?: ChartPoint;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function formatTooltip(params: unknown) {
  const items = (Array.isArray(params) ? params : [params]) as TooltipParam[];
  const events = items
    .filter((item) => item.data?.event)
    .sort((a, b) => (b.data?.event.fps ?? 0) - (a.data?.event.fps ?? 0));

  if (events.length === 0) {
    return "";
  }

  const timestamp = events[0].data?.event.timestamp ?? 0;
  const title = escapeHtml(formatTimestamp(timestamp));

  return [
    `<div style="margin-bottom:8px;font-weight:700;color:#edf2ee">${title}</div>`,
    ...events.map((item) => {
      const event = item.data?.event;

      if (!event) {
        return "";
      }

      const color = item.color ?? "#6ee7b7";
      const description = event.description || "None";

      return `
        <div style="min-width:230px;border-top:1px solid rgba(199,210,204,.14);padding-top:8px;margin-top:8px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:6px">
            <span style="display:flex;align-items:center;gap:7px;color:${color};font-weight:700">
              <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${color}"></span>
              ${escapeHtml(event.user)}
            </span>
            <span style="color:#edf2ee;font-variant-numeric:tabular-nums">${event.fps} fps</span>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;color:#c3cbc7;font-size:12px;line-height:1.5">
            <span style="color:#9ca7a1">id</span><span>${event.id}</span>
            <span style="color:#9ca7a1">timestamp</span><span>${event.timestamp}</span>
            <span style="color:#9ca7a1">event</span><span>${escapeHtml(event.event)}</span>
            <span style="color:#9ca7a1">description</span><span>${escapeHtml(description)}</span>
          </div>
        </div>
      `;
    }),
  ].join("");
}

function buildSeries(events: FeedEvent[]) {
  const users = new Map<string, FeedEvent[]>();

  for (const event of events) {
    const userEvents = users.get(event.user) ?? [];
    userEvents.push(event);
    users.set(event.user, userEvents);
  }

  return Array.from(users.entries()).map(([user, userEvents], index) => ({
    user,
    color: colors[index % colors.length],
    points: userEvents
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((event) => ({
        value: [event.timestamp * 1000, event.fps] as [number, number],
        event,
      })),
  }));
}

function getAverageFps(events: FeedEvent[]) {
  const total = events.reduce((sum, event) => sum + event.fps, 0);

  return Math.round((total / events.length) * 10) / 10;
}

export default function Graph() {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  const series = useMemo(() => buildSeries(testData), []);
  const averageFps = useMemo(() => getAverageFps(testData), []);
  const firstTimestamp = Math.min(...testData.map((event) => event.timestamp));
  const lastTimestamp = Math.max(...testData.map((event) => event.timestamp));

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
        formatter: formatTooltip,
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
    </main>
  );
}

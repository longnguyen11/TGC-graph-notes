import { describe, expect, it } from "vitest";

import {
  buildFpsSeries,
  buildUserSummaries,
  escapeHtml,
  formatGraphTooltip,
  getAverageFps,
  getRecentEvents,
  getTimestampRange,
} from "./graph";
import type { FeedEvent } from "./graph";

const events: FeedEvent[] = [
  {
    id: 1,
    user: "david",
    fps: 25,
    timestamp: 30,
    event: "ping",
    description: "",
  },
  {
    id: 2,
    user: "James",
    fps: 60,
    timestamp: 20,
    event: "add_party",
    description: "david",
  },
  {
    id: 3,
    user: "david",
    fps: 31,
    timestamp: 10,
    event: "item_purchase",
    description: "season_pass",
  },
  {
    id: 4,
    user: "Puekam",
    fps: 44,
    timestamp: 20,
    event: "enter_level",
    description: "Level_Rain",
  },
];

describe("buildFpsSeries", () => {
  it("groups events by user and sorts each user's points by timestamp", () => {
    const series = buildFpsSeries(events);

    expect(series.map((item) => item.user)).toEqual([
      "david",
      "James",
      "Puekam",
    ]);
    expect(series[0].points.map((point) => point.event.id)).toEqual([3, 1]);
    expect(series[1].points.map((point) => point.event.id)).toEqual([2]);
    expect(series[2].points.map((point) => point.event.id)).toEqual([4]);
  });

  it("converts timestamp seconds to chart millisecond values", () => {
    const series = buildFpsSeries(events);

    expect(series[0].points[0].value).toEqual([10_000, 31]);
    expect(series[1].points[0].value).toEqual([20_000, 60]);
  });
});

describe("getAverageFps", () => {
  it("returns a rounded average fps", () => {
    expect(getAverageFps(events)).toBe(40);
  });

  it("returns zero for an empty event set", () => {
    expect(getAverageFps([])).toBe(0);
  });
});

describe("buildUserSummaries", () => {
  it("returns per-user fps ranges, averages, counts, and latest events", () => {
    const summaries = buildUserSummaries(events);

    expect(summaries).toEqual([
      {
        user: "david",
        color: "#6ee7b7",
        eventCount: 2,
        averageFps: 28,
        minFps: 25,
        maxFps: 31,
        latestEvent: events[0],
      },
      {
        user: "James",
        color: "#f5c867",
        eventCount: 1,
        averageFps: 60,
        minFps: 60,
        maxFps: 60,
        latestEvent: events[1],
      },
      {
        user: "Puekam",
        color: "#f08a70",
        eventCount: 1,
        averageFps: 44,
        minFps: 44,
        maxFps: 44,
        latestEvent: events[3],
      },
    ]);
  });

  it("returns an empty summary for an empty event set", () => {
    expect(buildUserSummaries([])).toEqual([]);
  });
});

describe("getRecentEvents", () => {
  it("returns the newest events first up to the requested limit", () => {
    expect(getRecentEvents(events, 2).map((event) => event.id)).toEqual([1, 4]);
  });

  it("uses id as a stable tie-breaker for matching timestamps", () => {
    const tiedEvents = [
      ...events,
      {
        id: 5,
        user: "James",
        fps: 59,
        timestamp: 30,
        event: "ping",
        description: "",
      },
    ];

    expect(getRecentEvents(tiedEvents, 2).map((event) => event.id)).toEqual([
      5, 1,
    ]);
  });
});

describe("getTimestampRange", () => {
  it("returns the first and last timestamps", () => {
    expect(getTimestampRange(events)).toEqual({
      firstTimestamp: 10,
      lastTimestamp: 30,
    });
  });

  it("returns zeroes for an empty event set", () => {
    expect(getTimestampRange([])).toEqual({
      firstTimestamp: 0,
      lastTimestamp: 0,
    });
  });
});

describe("formatGraphTooltip", () => {
  it("returns an empty tooltip when no chart event data is available", () => {
    expect(formatGraphTooltip([])).toBe("");
    expect(formatGraphTooltip({})).toBe("");
  });

  it("includes every required data-point property", () => {
    const tooltip = formatGraphTooltip({
      color: "#6ee7b7",
      data: {
        value: [10_000, 31],
        event: events[2],
      },
    });

    expect(tooltip).toContain("david");
    expect(tooltip).toContain("31 fps");
    expect(tooltip).toContain("<span>3</span>");
    expect(tooltip).toContain("<span>10</span>");
    expect(tooltip).toContain("item_purchase");
    expect(tooltip).toContain("season_pass");
  });

  it("orders multiple tooltip rows by fps descending", () => {
    const series = buildFpsSeries(events);
    const tooltip = formatGraphTooltip([
      { color: "#6ee7b7", data: series[0].points[0] },
      { color: "#f5c867", data: series[1].points[0] },
    ]);

    expect(tooltip.indexOf("James")).toBeLessThan(tooltip.indexOf("david"));
  });

  it("escapes html-sensitive event text", () => {
    const tooltip = formatGraphTooltip({
      data: {
        value: [40_000, 55],
        event: {
          id: 4,
          user: "<Alex>",
          fps: 55,
          timestamp: 40,
          event: "ping&wait",
          description: "<script>alert(1)</script>",
        },
      },
    });

    expect(tooltip).toContain("&lt;Alex&gt;");
    expect(tooltip).toContain("ping&amp;wait");
    expect(tooltip).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});

describe("escapeHtml", () => {
  it("escapes ampersands and angle brackets", () => {
    expect(escapeHtml("A&B < C > D")).toBe("A&amp;B &lt; C &gt; D");
  });
});

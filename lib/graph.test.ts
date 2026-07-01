import { describe, expect, it } from "vitest";

import { buildFpsSeries, getAverageFps, getTimestampRange } from "./graph";
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
];

describe("buildFpsSeries", () => {
  it("groups events by user and sorts each user's points by timestamp", () => {
    const series = buildFpsSeries(events);

    expect(series.map((item) => item.user)).toEqual(["david", "James"]);
    expect(series[0].points.map((point) => point.event.id)).toEqual([3, 1]);
    expect(series[1].points.map((point) => point.event.id)).toEqual([2]);
  });

  it("converts timestamp seconds to chart millisecond values", () => {
    const series = buildFpsSeries(events);

    expect(series[0].points[0].value).toEqual([10_000, 31]);
    expect(series[1].points[0].value).toEqual([20_000, 60]);
  });
});

describe("getAverageFps", () => {
  it("returns a rounded average fps", () => {
    expect(getAverageFps(events)).toBe(38.7);
  });

  it("returns zero for an empty event set", () => {
    expect(getAverageFps([])).toBe(0);
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

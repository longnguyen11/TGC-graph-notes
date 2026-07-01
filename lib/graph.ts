export type FeedEvent = {
  id: number;
  user: string;
  fps: number;
  timestamp: number;
  event: string;
  description: string;
};

export type ChartPoint = {
  value: [number, number];
  event: FeedEvent;
};

export type ChartSeries = {
  user: string;
  color: string;
  points: ChartPoint[];
};

const colors = ["#6ee7b7", "#f5c867", "#f08a70", "#60a5fa", "#c084fc"];

export function buildFpsSeries(events: FeedEvent[]) {
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

export function getAverageFps(events: FeedEvent[]) {
  if (events.length === 0) {
    return 0;
  }

  const total = events.reduce((sum, event) => sum + event.fps, 0);

  return Math.round((total / events.length) * 10) / 10;
}

export function getTimestampRange(events: FeedEvent[]) {
  if (events.length === 0) {
    return { firstTimestamp: 0, lastTimestamp: 0 };
  }

  return {
    firstTimestamp: Math.min(...events.map((event) => event.timestamp)),
    lastTimestamp: Math.max(...events.map((event) => event.timestamp)),
  };
}

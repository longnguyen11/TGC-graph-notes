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

export type UserSummary = {
  user: string;
  color: string;
  eventCount: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  latestEvent: FeedEvent;
};

export type TooltipParam = {
  color?: string;
  seriesName?: string;
  data?: ChartPoint;
};

const colors = ["#6ee7b7", "#f5c867", "#f08a70", "#60a5fa", "#c084fc"];
const fallbackColor = "#6ee7b7";

function groupEventsByUser(events: FeedEvent[]) {
  const users = new Map<string, FeedEvent[]>();

  for (const event of events) {
    const userEvents = users.get(event.user) ?? [];
    userEvents.push(event);
    users.set(event.user, userEvents);
  }

  return users;
}

export function buildFpsSeries(events: FeedEvent[]) {
  const users = groupEventsByUser(events);

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

export function buildUserSummaries(events: FeedEvent[]) {
  const users = groupEventsByUser(events);

  return Array.from(users.entries()).map(([user, userEvents], index) => {
    const fpsValues = userEvents.map((event) => event.fps);
    const latestEvent = userEvents.reduce((latest, event) =>
      event.timestamp > latest.timestamp ? event : latest,
    );

    return {
      user,
      color: colors[index % colors.length],
      eventCount: userEvents.length,
      averageFps: getAverageFps(userEvents),
      minFps: Math.min(...fpsValues),
      maxFps: Math.max(...fpsValues),
      latestEvent,
    };
  });
}

export function getRecentEvents(events: FeedEvent[], limit = 5) {
  return events
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp || b.id - a.id)
    .slice(0, limit);
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

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function tooltipField(label: string, value: string | number) {
  return `<span class="graph-tooltip__label">${label}</span><span>${value}</span>`;
}

function tooltipEventSection(item: TooltipParam) {
  const event = item.data?.event;

  if (!event) {
    return "";
  }

  const color = item.color ?? fallbackColor;
  const description = event.description || "None";

  return [
    `<div class="graph-tooltip__section" style="--tooltip-color:${color}">`,
    '<div class="graph-tooltip__heading">',
    '<span class="graph-tooltip__user">',
    '<span class="graph-tooltip__marker"></span>',
    escapeHtml(event.user),
    "</span>",
    `<span class="graph-tooltip__fps">${event.fps} fps</span>`,
    "</div>",
    '<div class="graph-tooltip__grid">',
    tooltipField("id", event.id),
    tooltipField("timestamp", event.timestamp),
    tooltipField("event", escapeHtml(event.event)),
    tooltipField("description", escapeHtml(description)),
    "</div>",
    "</div>",
  ].join("");
}

export function formatGraphTooltip(params: unknown) {
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
    `<div class="graph-tooltip__title">${title}</div>`,
    ...events.map(tooltipEventSection),
  ].join("");
}

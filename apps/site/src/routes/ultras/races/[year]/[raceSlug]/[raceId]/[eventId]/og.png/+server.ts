import { error } from "@sveltejs/kit";
import { RaceDataManager } from "$lib/races.server";
import { readFileSync } from "fs";
import { resolve } from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Participant } from "@jpoehnelt/ultrasignup-scraper/types";

export const prerender = true;

// Cache the font at module level
let interFont: ArrayBuffer | null = null;

async function loadFonts() {
  if (!interFont) {
    // Use the Inter font in TTF format from Google Fonts (satori doesn't support woff2)
    const fontResponse = await fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    );
    if (!fontResponse.ok) {
      throw new Error(`Failed to load font: ${fontResponse.status}`);
    }
    interFont = await fontResponse.arrayBuffer();
  }
  return { interFont };
}

interface CompetitivenessStats {
  totalEntrants: number;
  rankedEntrants: number;
  insufficientResultsCount: number;
  unrankedCount: number;
  averageRank: number;
  medianRank: number;
  eliteCount: number;
  strongCount: number;
  midPackCount: number;
  newcomerCount: number;
  rankDistribution: { label: string; count: number; percent: number }[];
}

function calculateCompetitiveness(
  entrants: Participant[] | null,
): CompetitivenessStats | null {
  if (!entrants || entrants.length === 0) return null;

  const MIN_RESULTS_FOR_RANKING = 5;
  const qualifiedEntrants = entrants.filter(
    (e) => e.rank && e.rank > 0 && (e.results ?? 0) >= MIN_RESULTS_FOR_RANKING,
  );
  const insufficientResultsCount = entrants.filter(
    (e) => e.rank && e.rank > 0 && (e.results ?? 0) < MIN_RESULTS_FOR_RANKING,
  ).length;
  const unrankedCount = entrants.filter((e) => !e.rank || e.rank === 0).length;

  const ranks = qualifiedEntrants.map((e) => e.rank!).sort((a, b) => b - a);

  if (ranks.length === 0) return null;

  const eliteCount = ranks.filter((r) => r >= 90).length;
  const strongCount = ranks.filter((r) => r >= 80 && r < 90).length;
  const midPackCount = ranks.filter((r) => r >= 60 && r < 80).length;
  const newcomerCount = ranks.filter((r) => r > 0 && r < 60).length;

  const sum = ranks.reduce((a, b) => a + b, 0);
  const averageRank = sum / ranks.length;
  const medianRank = ranks[Math.floor(ranks.length / 2)];

  const totalForPercent = entrants.length;
  const newRunnersCount = insufficientResultsCount + unrankedCount;
  const rankDistribution = [
    {
      label: "90+",
      count: eliteCount,
      percent: totalForPercent > 0 ? (eliteCount / totalForPercent) * 100 : 0,
    },
    {
      label: "80-89",
      count: strongCount,
      percent: totalForPercent > 0 ? (strongCount / totalForPercent) * 100 : 0,
    },
    {
      label: "60-79",
      count: midPackCount,
      percent: totalForPercent > 0 ? (midPackCount / totalForPercent) * 100 : 0,
    },
    {
      label: "<60",
      count: newcomerCount,
      percent:
        totalForPercent > 0 ? (newcomerCount / totalForPercent) * 100 : 0,
    },
    {
      label: "New",
      count: newRunnersCount,
      percent:
        totalForPercent > 0 ? (newRunnersCount / totalForPercent) * 100 : 0,
    },
  ];

  return {
    totalEntrants: entrants.length,
    rankedEntrants: qualifiedEntrants.length,
    insufficientResultsCount,
    unrankedCount,
    averageRank,
    medianRank,
    eliteCount,
    strongCount,
    midPackCount,
    newcomerCount,
    rankDistribution,
  };
}

function getBucketColor(label: string): string {
  switch (label) {
    case "90+":
      return "#a855f7"; // purple-500
    case "80-89":
      return "#3b82f6"; // blue-500
    case "60-79":
      return "#22c55e"; // green-500
    case "New":
      return "#fbbf24"; // amber-400
    default:
      return "#94a3b8"; // slate-400
  }
}

function getGradientColor(label: string): string {
  switch (label) {
    case "90+":
      return "linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)"; // purple gradient
    case "80-89":
      return "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)"; // blue gradient
    case "60-79":
      return "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"; // green gradient
    case "New":
      return "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)"; // amber gradient
    default:
      return "linear-gradient(90deg, #94a3b8 0%, #64748b 100%)"; // slate gradient
  }
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, fetch }) {
  const { raceId, eventId } = params;

  // Read races from filesystem
  const racesPath = resolve("../../data/races.json");
  const racesJson = readFileSync(racesPath, "utf-8");
  const races = JSON.parse(racesJson);

  const race = races.find((r: any) => r.id === Number(raceId));
  if (!race) {
    throw error(404, "Race not found");
  }

  const event = race.events?.find((e: any) => e.id === Number(eventId));
  if (!event) {
    throw error(404, "Event not found");
  }

  // Get entrants data
  const raceManager = new RaceDataManager(fetch);
  const entrantsData = await raceManager.getEntrants(
    Number(raceId),
    Number(eventId),
  );
  const competitiveness = calculateCompetitiveness(entrantsData);

  // Get waitlist data - get count from most recent snapshot
  const waitlistHistory = await raceManager.getWaitlist(
    Number(raceId),
    Number(eventId),
  );
  const latestWaitlist =
    waitlistHistory?.length > 0
      ? waitlistHistory[waitlistHistory.length - 1]
      : null;
  const waitlistCount = latestWaitlist?.count || 0;

  // Description variations - randomly pick one
  const waitlistDescriptions = [
    `Browse the start list and runner rankings. ${waitlistCount} on waitlist – will you get in?`,
    `${waitlistCount} runners waiting for a spot. Check your chances of getting in.`,
    `See who's registered and ${waitlistCount} on waitlist. Find out if you'll make the start line.`,
    `Full runner list with rankings. ${waitlistCount} hoping to get off the waitlist.`,
    `Browse all entrants by ranking. ${waitlistCount} still waiting – are you one of them?`,
  ];
  const noWaitlistDescriptions = [
    "Browse the full start list with runner rankings and field strength breakdown.",
    "See who you're racing against. Full entrant list with rankings.",
    "Check out the competition. Every runner ranked by experience.",
    "Full start list with runner rankings. Know your competition.",
    "See all registered runners ranked by experience level.",
  ];
  const description =
    waitlistCount > 0
      ? waitlistDescriptions[
          Math.floor(Math.random() * waitlistDescriptions.length)
        ]
      : noWaitlistDescriptions[
          Math.floor(Math.random() * noWaitlistDescriptions.length)
        ];

  // Load fonts
  const { interFont } = await loadFonts();

  // Create the OG image using satori
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
          fontFamily: "Inter",
          overflow: "hidden",
        },
        children: [
          // Topographic contour lines background
          {
            type: "svg",
            props: {
              viewBox: "0 0 1200 630",
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              },
              children: [
                {
                  type: "path",
                  props: {
                    d: "M-75,580 Q200,520 400,550 T800,480 T1275,520",
                    fill: "none",
                    stroke: "rgba(255,255,255,0.05)",
                    strokeWidth: "1.5",
                  },
                },
                {
                  type: "path",
                  props: {
                    d: "M-75,450 Q100,350 300,400 T700,300 T1100,370 T1275,340",
                    fill: "none",
                    stroke: "rgba(255,255,255,0.08)",
                    strokeWidth: "2",
                  },
                },
                {
                  type: "path",
                  props: {
                    d: "M-75,380 Q180,260 380,320 T780,200 T1150,280 T1275,230",
                    fill: "none",
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: "2",
                  },
                },
                {
                  type: "path",
                  props: {
                    d: "M-75,300 Q120,180 320,230 T720,120 T1100,200 T1275,140",
                    fill: "none",
                    stroke: "rgba(255,255,255,0.08)",
                    strokeWidth: "1.5",
                  },
                },
                {
                  type: "path",
                  props: {
                    d: "M-75,220 Q160,100 360,150 T760,50 T1150,130 T1275,60",
                    fill: "none",
                    stroke: "rgba(255,255,255,0.05)",
                    strokeWidth: "1.5",
                  },
                },
              ],
            },
          },
          // Orange glow (top right)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-180px",
                right: "-80px",
                width: "600px",
                height: "600px",
                background:
                  "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(234,88,12,0.06) 40%, transparent 70%)",
                borderRadius: "50%",
              },
            },
          },
          // Purple glow (bottom left)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "-100px",
                left: "-100px",
                width: "400px",
                height: "400px",
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 60%)",
                borderRadius: "50%",
              },
            },
          },
          // Main content - single column centered
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                padding: "40px 56px 60px",
                position: "relative",
              },
              children: [
                // Top badges row
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    },
                    children: [
                      // RACE ANALYSIS badge
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            padding: "6px 14px",
                            background:
                              "linear-gradient(90deg, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.15) 100%)",
                            borderRadius: "20px",
                            border: "1px solid rgba(249,115,22,0.3)",
                          },
                          children: {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                fontSize: "11px",
                                color: "#fb923c",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                              },
                              children: "WHO'S RUNNING",
                            },
                          },
                        },
                      },
                      // Race date badge
                      race.date
                        ? {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                padding: "6px 14px",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "20px",
                              },
                              children: {
                                type: "div",
                                props: {
                                  style: {
                                    display: "flex",
                                    fontSize: "11px",
                                    color: "#94a3b8",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                  },
                                  children: new Date(race.date)
                                    .toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                    .toUpperCase(),
                                },
                              },
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  },
                },
                // Race title
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "22px",
                      color: "#94a3b8",
                      fontWeight: 500,
                      marginBottom: "2px",
                    },
                    children: race.title,
                  },
                },
                // Event title (HERO)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "64px",
                      color: "#ffffff",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      marginBottom: "28px",
                    },
                    children: event.title,
                  },
                },
                // Stats row - centered
                competitiveness
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        },
                        children: [
                          // Registered
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                background: "rgba(249,115,22,0.12)",
                                padding: "14px 20px",
                                borderRadius: "12px",
                                border: "1px solid rgba(249,115,22,0.2)",
                              },
                              children: [
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      fontSize: "10px",
                                      color: "#fb923c",
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.1em",
                                      marginBottom: "2px",
                                    },
                                    children: "REGISTERED",
                                  },
                                },
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      fontSize: "36px",
                                      fontWeight: 800,
                                      color: "#ffffff",
                                      letterSpacing: "-0.02em",
                                    },
                                    children: String(
                                      competitiveness.totalEntrants,
                                    ),
                                  },
                                },
                              ],
                            },
                          },
                          // Waitlist (if > 0)
                          waitlistCount > 0
                            ? {
                                type: "div",
                                props: {
                                  style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "rgba(34,197,94,0.1)",
                                    padding: "14px 20px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(34,197,94,0.2)",
                                  },
                                  children: [
                                    {
                                      type: "div",
                                      props: {
                                        style: {
                                          display: "flex",
                                          fontSize: "10px",
                                          color: "#4ade80",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                          marginBottom: "2px",
                                        },
                                        children: "WAITLIST",
                                      },
                                    },
                                    {
                                      type: "div",
                                      props: {
                                        style: {
                                          display: "flex",
                                          fontSize: "36px",
                                          fontWeight: 800,
                                          color: "#ffffff",
                                          letterSpacing: "-0.02em",
                                        },
                                        children: String(waitlistCount),
                                      },
                                    },
                                  ],
                                },
                              }
                            : null,
                          // Elite (if > 0)
                          competitiveness.eliteCount > 0
                            ? {
                                type: "div",
                                props: {
                                  style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "rgba(168,85,247,0.12)",
                                    padding: "14px 20px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(168,85,247,0.2)",
                                  },
                                  children: [
                                    {
                                      type: "div",
                                      props: {
                                        style: {
                                          display: "flex",
                                          fontSize: "10px",
                                          color: "#c084fc",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                          marginBottom: "2px",
                                        },
                                        children: "ELITE 90+",
                                      },
                                    },
                                    {
                                      type: "div",
                                      props: {
                                        style: {
                                          display: "flex",
                                          fontSize: "36px",
                                          fontWeight: 800,
                                          color: "#ffffff",
                                          letterSpacing: "-0.02em",
                                        },
                                        children: String(
                                          competitiveness.eliteCount,
                                        ),
                                      },
                                    },
                                  ],
                                },
                              }
                            : null,
                          // Avg rank
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                background: "rgba(59,130,246,0.1)",
                                padding: "14px 20px",
                                borderRadius: "12px",
                                border: "1px solid rgba(59,130,246,0.2)",
                              },
                              children: [
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      fontSize: "10px",
                                      color: "#60a5fa",
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.1em",
                                      marginBottom: "2px",
                                    },
                                    children: "AVG RANK",
                                  },
                                },
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      fontSize: "36px",
                                      fontWeight: 800,
                                      color: "#ffffff",
                                      letterSpacing: "-0.02em",
                                    },
                                    children:
                                      competitiveness.averageRank.toFixed(1),
                                  },
                                },
                              ],
                            },
                          },
                          // Median rank
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                background: "rgba(255,255,255,0.05)",
                                padding: "14px 20px",
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.08)",
                              },
                              children: [
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      fontSize: "10px",
                                      color: "#94a3b8",
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.1em",
                                      marginBottom: "2px",
                                    },
                                    children: "MEDIAN",
                                  },
                                },
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      fontSize: "36px",
                                      fontWeight: 800,
                                      color: "#ffffff",
                                      letterSpacing: "-0.02em",
                                    },
                                    children:
                                      competitiveness.medianRank.toFixed(1),
                                  },
                                },
                              ],
                            },
                          },
                        ].filter(Boolean),
                      },
                    }
                  : null,
                // Spacer with description
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                    },
                    children: {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "18px",
                          color: "#94a3b8",
                          fontWeight: 400,
                          lineHeight: 1.4,
                        },
                        children: description,
                      },
                    },
                  },
                },
                // Field composition - horizontal stacked bar
                competitiveness
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "8px",
                        },
                        children: [
                          // Label
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                                marginBottom: "10px",
                              },
                              children: "FIELD COMPOSITION",
                            },
                          },
                          // Stacked bar
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                height: "28px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                gap: "2px",
                              },
                              children: competitiveness.rankDistribution.map(
                                (bucket) => ({
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      width: `${Math.max(bucket.percent, 3)}%`,
                                      height: "100%",
                                      background: getGradientColor(
                                        bucket.label,
                                      ),
                                      alignItems: "center",
                                      justifyContent: "center",
                                    },
                                    children:
                                      bucket.percent >= 8
                                        ? {
                                            type: "div",
                                            props: {
                                              style: {
                                                display: "flex",
                                                fontSize: "10px",
                                                color: "#ffffff",
                                                fontWeight: 700,
                                              },
                                              children: `${Math.round(bucket.percent)}%`,
                                            },
                                          }
                                        : null,
                                  },
                                }),
                              ),
                            },
                          },
                          // Legend
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                gap: "16px",
                                marginTop: "8px",
                              },
                              children: competitiveness.rankDistribution.map(
                                (bucket) => ({
                                  type: "div",
                                  props: {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    },
                                    children: [
                                      {
                                        type: "div",
                                        props: {
                                          style: {
                                            display: "flex",
                                            width: "10px",
                                            height: "10px",
                                            borderRadius: "3px",
                                            background: getBucketColor(
                                              bucket.label,
                                            ),
                                          },
                                        },
                                      },
                                      {
                                        type: "div",
                                        props: {
                                          style: {
                                            display: "flex",
                                            fontSize: "11px",
                                            color: "#94a3b8",
                                            fontWeight: 500,
                                          },
                                          children: bucket.label,
                                        },
                                      },
                                    ],
                                  },
                                }),
                              ),
                            },
                          },
                        ],
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Bottom bar
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 56px",
                background: "rgba(0,0,0,0.3)",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 500,
                    },
                    children: "justin.poehnelt.com",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "12px",
                      color: "#f97316",
                      fontWeight: 600,
                    },
                    children: competitiveness
                      ? `See All ${competitiveness.totalEntrants} Runners →`
                      : "See All Runners →",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interFont!,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  // Read directly from filesystem during pre-rendering
  const racesPath = resolve("../../data/races.json");
  const racesJson = readFileSync(racesPath, "utf-8");
  const races = JSON.parse(racesJson);

  // Return all events for all races
  const entries = [];
  for (const race of races) {
    if (race.events) {
      for (const event of race.events) {
        entries.push({
          year: String(race.year),
          raceSlug: race.slug,
          raceId: String(race.id),
          eventId: String(event.id),
        });
      }
    }
  }
  return entries;
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Startoor — a curated marketplace for AI-built apps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F5F1E8",
          padding: "90px 90px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#8F8B80",
            fontSize: 20,
            fontFamily: "monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ height: 2, width: 60, background: "#1C1C1A" }} />
          <span>Est. 2026</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 112,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#1C1C1A",
              fontFamily: "serif",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>A curated marketplace</span>
            <span>
              <span style={{ fontStyle: "italic", color: "#1F3A2F" }}>for </span>
              AI-built apps.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            color: "#2E2E2B",
            fontSize: 28,
            fontFamily: "sans-serif",
          }}
        >
          <span>startoor.vercel.app</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#C85A3F",
              fontSize: 22,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            ✦ Curator picks
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}

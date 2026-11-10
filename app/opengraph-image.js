import { ImageResponse } from "next/og";

export const alt = "TeachLoop — Train how you communicate, not just what you know.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAF7F2",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "#C2410C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            TL
          </div>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 800,
              color: "#1C1917",
              letterSpacing: "-0.03em",
            }}
          >
            TeachLoop
          </span>
        </div>

        {/* Main Headline */}
        <div
          style={{
            fontSize: "62px",
            fontWeight: 800,
            color: "#1C1917",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.04em",
            maxWidth: "1000px",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span>Train how you </span>
          <span style={{ color: "#C2410C", marginLeft: "14px", marginRight: "14px" }}>
            communicate,
          </span>
          <span>not just what you know.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#78716C",
            textAlign: "center",
            maxWidth: "840px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          AI-powered coaching for technical professionals · Teach, Interview &amp; Sketch Modes
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {["5 Audience Personas", "System Design Questions", "Progressive Hints", "Interactive Whiteboard"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E7E5E4",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#44403C",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

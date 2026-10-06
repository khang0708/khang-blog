import { ImageResponse } from "next/og";

export const alt = "Huỳnh Nhật Khang, Senior Fullstack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "#0b1620",
          color: "#E6F1F2",
        }}
      >
        <div style={{ fontSize: 28, color: "#4FD1C5", marginBottom: 20 }}>Senior fullstack developer</div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1 }}>Huỳnh Nhật Khang</div>
        <div style={{ fontSize: 30, color: "#8AA3AB", marginTop: 24 }}>
          Web platforms that hold up under load: real-time, payments and AI.
        </div>
      </div>
    ),
    size,
  );
}

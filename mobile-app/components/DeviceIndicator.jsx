import React from "react";
import BatteryIndicator from "./BatteryIndicator";
import SignalIndicator from "./SignalIndicator";
import RadarAccuracy from "./RadarAccuracy";

export default function DeviceIndicator({ type, value, ...props }) {
  switch (type) {
    case "battery":
      return <BatteryIndicator level={value} {...props} />;
    case "signal":
      return <SignalIndicator signal={value} {...props} />;
    case "gps":
    case "radar":
      return <RadarAccuracy accuracy={value} {...props} />;
    default:
      return null;
  }
}

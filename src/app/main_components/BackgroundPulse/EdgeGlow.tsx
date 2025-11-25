"use client";

import { motion } from "framer-motion";
import { JSX } from "react";

const colors = [
  "rgba(239,68,68,1)",   // red
  "rgba(59,130,246,1)",  // blue
  "rgba(34,197,94,1)",   // green
  "rgba(168,85,247,1)",  // purple
  "rgba(250,204,21,1)",  // yellow
  "rgba(0,0,0,1)",       // fade to black
  "rgba(239,68,68,1)",   // back to red
];

export default function EdgeGlow(): JSX.Element {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {["top", "bottom", "left", "right"].map((pos) => (
        <motion.div
          key={pos}
          className={`
            absolute blur-3xl mix-blend-screen
            ${pos === "top" ? "top-0 left-0 right-0 h-12" : ""}
            ${pos === "bottom" ? "bottom-0 left-0 right-0 h-12" : ""}
            ${pos === "left" ? "top-0 bottom-0 left-0 w-12" : ""}
            ${pos === "right" ? "top-0 bottom-0 right-0 w-12" : ""}
          `}
          animate={{
            backgroundColor: colors,
            opacity: [0.5, 1, 0.7, 1, 0.5],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

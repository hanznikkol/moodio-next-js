import { JSX } from "react";
import "../Pulse/EdgeGlow.css";

export default function EdgeGlow (): JSX.Element {
    return (
    <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top */}
        <div className="absolute top-0 left-0 right-0 h-8 blur-3xl opacity-0 edges-glow"></div>
        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 blur-3xl opacity-0 edges-glow"></div>
        {/* Left */}
        <div className="absolute top-0 bottom-0 left-0 w-8 blur-3xl opacity-0 edges-glow"></div>
        {/* Right */}
        <div className="absolute top-0 bottom-0 right-0 w-8 blur-3xl opacity-0 edges-glow"></div>
    </div>
    )
}

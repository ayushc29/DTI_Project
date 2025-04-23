"use client"; // Client-side component

import { useEffect } from "react";

const ParticleBackground = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/particles.js"; // Ensure particles.js is available in the public folder
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div className="content--canvas"></div>;
};

export default ParticleBackground;
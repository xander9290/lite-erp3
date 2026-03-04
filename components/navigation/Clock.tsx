"use client";

import { hourClock } from "@/app/libs/helpers";
import { useState, useEffect } from "react";

function Clock() {
  const [clock, setClock] = useState<string>("00:00 --");
  const [showColon, setShowColon] = useState<boolean>(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClock(hourClock());
      setShowColon((prev) => !prev); // Alternar visibilidad del colon
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {clock.split(":")[0]}
      <span style={{ visibility: showColon ? "visible" : "hidden" }}>:</span>
      {clock.split(":")[1]}
    </>
  );
}

export default Clock;

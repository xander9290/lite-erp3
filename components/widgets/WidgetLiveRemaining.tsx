"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "react-bootstrap";

interface WidgetLiveRemainingProps {
  date: Date | string | null;
}

function getElapsedTime(fromDate: Date, toDate: Date = new Date()) {
  const diffMs = toDate.getTime() - fromDate.getTime();

  if (diffMs < 0) {
    return "Aún no inicia";
  }

  const totalMinutes = Math.floor(diffMs / 1000 / 60);

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} día${days !== 1 ? "s" : ""}, ${hours} hora${hours !== 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    return `${hours} hora${hours !== 1 ? "s" : ""}, ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return "Hace un momento";
}

export function WidgetLiveRemaining({ date }: WidgetLiveRemainingProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(
      () => {
        setNow(new Date());
      },
      3 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const elapsed = useMemo(() => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return getElapsedTime(parsedDate, now);
  }, [date, now]);

  if (!elapsed) return null;

  return <div className="text-center fw-semibold">{elapsed}</div>;
}

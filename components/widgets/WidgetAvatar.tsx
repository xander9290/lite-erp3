"use client";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export function WidgetAvatar({
  imageUrl,
  name = "displayAvatar",
  width = 32,
  height = 32,
  displayName,
}: {
  imageUrl?: string | null;
  name?: string;
  width?: number;
  height?: number;
  displayName?: boolean;
}) {
  return (
    <Zoom>
      <div className={displayName ? "d-flex align-items-center gap-1" : ""}>
        <Image
          title={name}
          unoptimized
          src={imageUrl ?? "/images/avatar_default.svg"}
          width={width}
          height={height}
          alt="imageAvatar"
          className="img-fluid rounded"
          onClick={(e) => e.stopPropagation()}
        />
        {displayName && <span>{displayName}</span>}
      </div>
    </Zoom>
  );
}

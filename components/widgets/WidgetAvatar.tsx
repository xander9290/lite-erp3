"use client";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export function WidgetAvatar({
  imageUrl,
  name = "displayAvatar",
}: {
  imageUrl?: string | null;
  name?: string;
}) {
  return (
    <Zoom>
      <Image
        title={name}
        unoptimized
        src={imageUrl ?? "/images/avatar_default.svg"}
        width={32}
        height={32}
        alt="imageAvatar"
        className="rounded"
        onClick={(e) => e.stopPropagation()}
      />
    </Zoom>
  );
}

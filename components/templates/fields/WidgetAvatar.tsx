"use client";
import { getUserById } from "@/app/(auth)/app/users/actions/user-actions";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export function WidgetAvatar({
  id,
  name = "displayAvatar",
}: {
  id: string | null;
  name?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const getUserAvatar = useCallback(async () => {
    const getUser = await getUserById({ id });
    if (getUser) {
      const imageUrl: string | null = getUser.Partner?.imageUrl || null;
      setImageUrl(imageUrl);
    }
  }, [id]);

  useEffect(() => {
    getUserAvatar();
  }, [getUserAvatar]);

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
      />
    </Zoom>
  );
}

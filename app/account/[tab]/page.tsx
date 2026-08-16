"use client";

import { useParams } from "next/navigation";
import ProfilePage from "../../profile/page";

export default function AccountTabRoute() {
  const params = useParams<{ tab: string }>();
  return <ProfilePage paramsTab={params.tab} />;
}

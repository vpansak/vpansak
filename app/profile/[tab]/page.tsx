"use client";

import { useParams } from "next/navigation";
import ProfilePage from "../page";

export default function ProfileTabRoute() {
  const params = useParams<{ tab: string }>();
  return <ProfilePage paramsTab={params.tab} />;
}

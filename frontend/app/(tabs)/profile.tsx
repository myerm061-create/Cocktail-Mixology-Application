import { useEffect } from "react";
import { router } from "expo-router";
import { ME_ID } from "@/scripts/data/mockProfiles";

export default function ProfileTab() {
  useEffect(() => {
    router.replace(`/${String(ME_ID)}`); 
  }, []);
  return null;
}

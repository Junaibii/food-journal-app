import api from "./api";
import type { StampDefinition, UserStamp } from "@/types";

export async function getAllStamps(): Promise<StampDefinition[]> {
  const res = await api.get<StampDefinition[]>("/passport/stamps");
  return res.data;
}

export async function getMyStamps(): Promise<UserStamp[]> {
  const res = await api.get<UserStamp[]>("/passport/my-stamps");
  return res.data;
}

export async function checkStamps(): Promise<void> {
  await api.post("/passport/check");
}

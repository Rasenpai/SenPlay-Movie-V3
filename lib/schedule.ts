import { fetchData } from "./api";

export type ScheduleItem = {
  id: number;
  title: string;
  slug: string;
  poster: string;
  rating: string;
  season: number;
  episode: number;
  episode_title: string | null;
  available: boolean;
};

export type ScheduleDay = {
  slug: string;
  name: string;
  date: string;
  is_today: boolean;
  total: number;
  items: ScheduleItem[];
};

type ScheduleResponse = {
  days: ScheduleDay[];
};

export async function getSchedule(): Promise<ScheduleDay[]> {
  const data = await fetchData<ScheduleResponse>("/series/schedule");
  return data?.days ?? [];
}
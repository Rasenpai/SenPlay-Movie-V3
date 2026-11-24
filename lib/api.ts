const BASE_URL = "https://api.senplay.web.id/api";
const REVALIDATE_SECONDS = 300;

export async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
import EpisodeCard from "./EpisodeCard";
import PosterRow from "./PosterRow";
import type { NewEpisodeItem } from "@/lib/episodes";

const SLIDE_BUTTON_TOP_PX = 110;
const PRIORITY_COUNT = 3;

export default function NewEpisodeSection({
  items,
}: {
  items: NewEpisodeItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="new-episode-title" className="pb-6">
      <h2
        id="new-episode-title"
        className="mb-4 px-5 text-lg font-semibold md:px-12"
      >
        Episode Terbaru
      </h2>

      <PosterRow buttonTop={SLIDE_BUTTON_TOP_PX}>
        {items.map((item, index) => (
          <EpisodeCard
            key={`${item.slug}-${item.episode_code}`}
            item={item}
            priority={index < PRIORITY_COUNT}
          />
        ))}
      </PosterRow>
    </section>
  );
}

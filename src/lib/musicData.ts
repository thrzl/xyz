const ALBUM_MBID = undefined;

type MusicBrainzLookup = {
  "cover-art-archive": {
    front: boolean;
  };
  title: string;
  id: string;
  "artist-credit": [
    {
      name: string;
      artist: {
        name: string;
        id: string;
        "sort-name": string;
      };
      joinphrase: string;
    },
  ];
};

type ListenBrainzStatsRes = {
  payload: {
    count: number;
    releases: {
      artist_mbids?: string[];
      artist_name: string;
      artists:
        | {
            artist_credit_name: string;
            artist_mbid: string;
            join_phrase: string;
          }[]
        | null;
      caa_id: string | null;
      release_mbid?: string | null;
      release_name: string;
    }[];
  };
};

type MinimalAlbum = {
  title: string;
  artists: { name: string; mbid: string; joinPhrase: string }[];
  mbid: string;
};

let topAlbum: MinimalAlbum | undefined;

export async function getAlbum(): Promise<MinimalAlbum | undefined> {
  if (topAlbum) return topAlbum;
  const mbid = ALBUM_MBID;

  if (mbid !== undefined) {
    let res = await fetch(
      `https://musicbrainz.org/ws/2/release/${mbid}?fmt=json&inc=artists`,
      { headers: { "User-Agent": "thrzl/xyz v0.1.0" } },
    );
    const results: MusicBrainzLookup = await res.json();
    topAlbum = {
      title: results.title,
      artists: results["artist-credit"].map((artist) => ({
        name: artist.name,
        joinPhrase: artist.joinphrase,
        mbid: artist.artist.id,
      })),
      mbid: results.id,
    };
    return topAlbum;
  }
  // https://open.spotify.com/oembed?url=https://open.spotify.com/album/40XTuBTvlOkvkT2LqF2AE7
  let res = await fetch(
    `https://api.listenbrainz.org/1/stats/user/thrizzle/releases?range=this_week`,
  );
  let result: ListenBrainzStatsRes = await res.json();
  let topResult = result.payload.releases.find(
    (release) => release.caa_id !== null,
  );
  topAlbum =
    topResult !== undefined
      ? {
          title: topResult.release_name,
          artists: (topResult.artists || []).map((artist) => ({
            name: artist.artist_credit_name,
            joinPhrase: artist.join_phrase,
            mbid: artist.artist_mbid,
          })),
          mbid: topResult.release_mbid!,
        }
      : undefined;
  return topAlbum;
}

export async function getColors(
  album: MinimalAlbum | undefined,
): Promise<[number, number, number][]> {
  if (!album) return [];
  const paletteRes = await fetch(
    `https://calore.thrzl.xyz/?image=https://coverartarchive.org/release/${album?.mbid}/front`,
  );

  const { palette }: { palette: [number, number, number][] } =
    await paletteRes.json();

  return palette;
}

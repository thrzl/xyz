const ALBUM_MBID = "f6e2def5-3283-42ea-9352-d2f9c5cd36c8";

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
let topAlbumColors: [number, number, number][];

export async function getAlbum(): Promise<MinimalAlbum | undefined> {
	if (topAlbum) return topAlbum;
	const mbid = ALBUM_MBID;

	if (mbid !== undefined) {
		const res = await fetch(
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
	const res = await fetch(
		`https://api.listenbrainz.org/1/stats/user/thrizzle/releases?range=this_week`,
	);
	const result: ListenBrainzStatsRes = await res.json();
	const topResult = result.payload.releases.find(
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
	if (topAlbumColors) return topAlbumColors;
	const paletteRes = await fetch(
		`https://calore.twofortyeight.net/?image=https://coverartarchive.org/release/${album?.mbid}/front`,
	);

	const { palette }: { palette: [number, number, number][] } =
		await paletteRes.json();

	topAlbumColors = palette;

	return palette;
}

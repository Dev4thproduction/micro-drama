import SeriesPlayer from '@/components/player/SeriesPlayer';

export default async function WatchPage(props: { params: Promise<{ seriesId: string }> }) {
    const params = await props.params;
    
    // The URL segment is named 'seriesId' by the folder structure, 
    // but in your 'Watch' flow, this value is actually an 'episodeId'.
    // We pass it to the player correctly here.
    return <SeriesPlayer episodeId={params.seriesId} />;
}
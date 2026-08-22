import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'webcmd-plugin-spotify',
  name: 'search',
  description: 'Search tracks on Spotify / WebCMD workflow',
  access: 'read',
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'query', positional: true, required: true, help: 'Song, artist, or album query' },
    { name: 'limit', type: 'int', required: false, default: 10, help: 'Number of results' }
  ],
  columns: ['title', 'artists', 'album', 'album_image_url', 'spotify_url', 'spotify_id', 'duration_ms'],
  func: async (kwargs) => {
    const query = String(kwargs.query || '');
    const limit = kwargs.limit || 10;
    
    // WebCMD Spotify Search Workflow
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (clientId && clientSecret) {
      try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
          },
          body: 'grant_type=client_credentials'
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
          });
          const searchData = await searchRes.json();
          if (searchData.tracks && searchData.tracks.items) {
            return searchData.tracks.items.map(t => ({
              title: t.name,
              artists: t.artists.map(a => a.name).join(', '),
              album: t.album.name,
              album_image_url: t.album.images[0]?.url || '',
              spotify_url: t.external_urls.spotify,
              spotify_id: t.id,
              duration_ms: t.duration_ms
            }));
          }
        }
      } catch (err) {
        console.error('Spotify API error, using web fallback', err);
      }
    }

    // Public Web Music Search Workflow
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`);
    const itunesData = await itunesRes.json();
    
    if (!itunesData.results || itunesData.results.length === 0) {
      return [];
    }

    return itunesData.results.map((item) => {
      const artwork = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');
      const trackId = `webcmd_${item.trackId || Math.floor(Math.random()*1000000)}`;
      
      return {
        title: item.trackName,
        artists: item.artistName,
        album: item.collectionName || 'Single',
        album_image_url: artwork,
        spotify_url: `https://open.spotify.com/track/${trackId}`,
        spotify_id: trackId,
        duration_ms: item.trackTimeMillis || 210000
      };
    });
  }
});

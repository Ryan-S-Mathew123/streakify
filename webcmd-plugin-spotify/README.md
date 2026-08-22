# webcmd-plugin-webcmd-plugin-spotify

Custom Spotify WebCMD plugin for SongStreak

## Install

```bash
# From local development directory
webcmd plugin install file://C:\Btech\Btech Projects\WEBCMD hackathon\webcmd-plugin-spotify

# From the catalog (after publishing)
webcmd plugin search webcmd-plugin-spotify -f json
webcmd plugin install <installSource-from-search>
```

## Commands

| Command | Type | Description |
|---------|------|-------------|
| `webcmd-plugin-spotify/hello` | Pipeline | Sample pipeline command |
| `webcmd-plugin-spotify/greet` | TypeScript | Sample TS command with func() |

## Development

```bash
# Install locally for development (symlinked, changes reflect immediately)
webcmd plugin install file://C:\Btech\Btech Projects\WEBCMD hackathon\webcmd-plugin-spotify

# Verify commands are registered
webcmd list | grep webcmd-plugin-spotify

# Run a command
webcmd webcmd-plugin-spotify hello
webcmd webcmd-plugin-spotify greet --name World
```

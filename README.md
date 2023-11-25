# Bundbot
Discord-Bot, welcher die [bund.dev-API](https://bund.dev/) nutzt, um mehr (oder weniger) hilfreiche Informationen anzuzeigen

## Setup

`config.json`:
```json
{
	"token": "<Discord-Bot-Token>"
}
```

## Features

### Autobahn
- Alle Autobahnen auflisten (`-list`)
- Webcams einer Autobahn auflisten (`-listwebcams <Autobahn>`)
- Webcams einer Autobahn auflisten (`-listwarnings <Autobahn>`)
- Baustellen einer Autobahn auflisten (`-listbaustellen <Autobahn>`)
- Sperrungen einer Autobahn auflisten (`-listsperrungen <Autobahn>`)
- Rastplätze einer Autobahn auflisten (`-listrastplätze <Autobahn>`)
- Elektrische Ladestationen einer Autobahn auflisten (`-listladestationen <Autobahn>`)

### NINA
- Katwarn-Meldungen anzeigen (`-katwarn`)
- Biwapp-Meldungen anzeigen (`-biwapp`)
- Mowas-Meldungen anzeigen (`-mowas`)

### Lebensmittel- und Produktwarnungen
- Lebensmittel- und Produktwarnungen anzeigen (`-produktwarn`)

const Discord = require("discord.js")
const bot = new Discord.Client({
	allowedMentions: {
		repliedUser: false,
		parse: ["users"]
	},
	intents: [
		Discord.GatewayIntentBits.Guilds
	]
})
bot.login(require("./config.json").token)

let roads = []
bot.on("ready", async () => {
	bot.user.setPresence({activities: [{name: "Custom Status", state: "bund.dev-Bot - Slashcommands", type: Discord.ActivityType.Custom}]})
	console.log("Bot ist online: " + bot.user.tag)

	const res = await fetch("https://verkehr.autobahn.de/o/autobahn", {
		headers: {
			Accept: "application/json"
		}
	})
	const json = await res.json()
	roads = json.roads

	const commands = [
		{
			name: "mowas",
			description: "Zeigt Meldungen und Warnungen von Mowas"
		},{
			name: "biwapp",
			description: "Zeigt Meldungen und Warnungen von Biwapp"
		},{
			name: "katwarn",
			description: "Zeigt Meldungen und Warnungen von Katwarn"
		},{
			name: "productwarn",
			description: "Zeigt aktuelle Produktwarnungen"
		},{
			name: "autobahn",
			description: "Autobahn-Infos",
			options: [{
				name: "list",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Listet alle Autobahnen auf"
			},{
				name: "webcams",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Listet alle Webcams einer Autobahn auf",
				options: [{
					name: "id",
					type: Discord.ApplicationCommandOptionType.String,
					description: "Der Name der Autobahn",
					autocomplete: true,
					required: true
				}]
			},{
				name: "warnings",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Listet alle Warnungen einer Autobahn auf",
				options: [{
					name: "id",
					type: Discord.ApplicationCommandOptionType.String,
					description: "Der Name der Autobahn",
					autocomplete: true,
					required: true
				}]
			},{
				name: "sperrungen",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Listet alle Sperrungen einer Autobahn auf",
				options: [{
					name: "id",
					type: Discord.ApplicationCommandOptionType.String,
					description: "Der Name der Autobahn",
					autocomplete: true,
					required: true
				}]
			},{
				name: "baustellen",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Zeigt Baustellen auf einer Autobahn",
				options: [{
					name: "id",
					type: Discord.ApplicationCommandOptionType.String,
					description: "Der Name der Autobahn",
					autocomplete: true,
					required: true
				}]
			},{
				name: "rastplaetze",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Zeigt Rastplätze auf einer Autobahn",
				options: [{
					name: "id",
					type: Discord.ApplicationCommandOptionType.String,
					description: "Der Name der Autobahn",
					autocomplete: true,
					required: true
				}]
			},{
				name: "ladestationen",
				type: Discord.ApplicationCommandOptionType.Subcommand,
				description: "Zeigt Elektro-Ladestationen auf einer Autobahn",
				options: [{
					name: "id",
					type: Discord.ApplicationCommandOptionType.String,
					description: "Der Name der Autobahn",
					autocomplete: true,
					required: true
				}]
			}]
		}
	]

	bot.application.commands.set(commands)
})

const warningIcon = severity => {
	if (severity == "Extreme") return "🚨 "
	if (severity == "Severe") return "‼️ "
	if (severity == "Minor") return "❗ "
	return ""
}
const checkAutobahn = str => /A\d{1,3}/g.test(str)

bot.on("interactionCreate", async interaction => {
	if (interaction.user.bot || interaction.channel.type == Discord.ChannelType.DM) return

	if (interaction.type == Discord.InteractionType.ApplicationCommandAutocomplete) {
		const input = interaction.options.getFocused(true)
		return interaction.respond(roads.filter(road => road.toLowerCase().includes(input.value)).map(road => ({name: road, value: road})).slice(0, 25))
	}

	const reply = data => {
		if (typeof data == "string" && data.length > 2000) data = data.substring(0, 1997) + "..."
		interaction.reply(data)
	}

	if (interaction.commandName == "autobahn") {
		const args = [interaction.options.getSubcommand(), interaction.options.getString("id", false)]
		if (args[0] == "list") {
			interaction.reply("Liste aller Autobahnen in Deutschland:\n\n" + roads.join(" "))
		} else if (args[0] == "webcams") {
			if (!checkAutobahn(args.join(" "))) return interaction.reply("Du musst eine gültige Autobahn angeben!")
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[1] + "/services/webcam", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			const webcams = []
			json.webcam.forEach(webcam => {
				if (webcam.linkurl != "" && webcam.linkurl != "https://#") webcams.push(webcam.subtitle + ": " + webcam.linkurl)
			})

			if (webcams.length == 0) return interaction.reply("Die Autobahn **" + args[1] + "** hat keine Webcams!")
			reply("Liste aller Webcams der **" + args[1] + "**:\n\n" + webcams.join("\n"))
		} else if (args[0] == "warnings") {
			if (!checkAutobahn(args.join(" "))) return interaction.reply("Du musst eine gültige Autobahn angeben!")
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[1] + "/services/warning", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			const warnings = []
			json.warning.forEach(warning => {
				warnings.push(warning.description.join(" "))
			})
			reply("Liste aller Verkehrsmeldungen der **" + args[1] + "**:\n\n" + warnings.join("\n"))
		} else if (args[0] == "baustellen") {
			if (!checkAutobahn(args.join(" "))) return interaction.reply("Du musst eine gültige Autobahn angeben!")
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[1] + "/services/roadworks", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			const baustellen = []
			json.roadworks.forEach(roadworks => {
				baustellen.push(roadworks.description.join(" "))
			})
			reply("Liste aller Baustellen der **" + args[1] + "**:\n\n" + baustellen.join("\n"))
		} else if (args[0] == "sperrungen") {
			if (!checkAutobahn(args.join(" "))) return interaction.reply("Du musst eine gültige Autobahn angeben!")
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[1] + "/services/closure", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			const sperrungen = []
			json.closure.forEach(closure => {
				sperrungen.push(closure.description.join(" "))
			})
			reply("Liste aller Sperrungen der **" + args[1] + "**:\n\n" + sperrungen.join("\n"))
		} else if (args[0] == "rastplaetze") {
			if (!checkAutobahn(args.join(" "))) return interaction.reply("Du musst eine gültige Autobahn angeben!")
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[1] + "/services/parking_lorry", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			const rastplatze = []
			json.parking_lorry.forEach(rastplatz => {
				rastplatze.push(rastplatz.title + ": " + rastplatz.description.map(desc => desc.trim()).join(", "))
			})
			reply("Liste aller Rastplätze der **" + args[1] + "**:\n\n" + rastplatze.join("\n"))
		} else if (args[0] == "ladestationen") {
			if (!checkAutobahn(args.join(" "))) return interaction.reply("Du musst eine gültige Autobahn angeben!")
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[1] + "/services/electric_charging_stations", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			const ladestationen = []
			json.electric_charging_stations.forEach(ladestation => {
				ladestationen.push(ladestation.description.join(" "))
			})
			if (ladestationen.length == 0) interaction.reply("Die **" + args[1] + "** hat keine elektrischen Ladestationen!")
			else reply("Liste aller Elektro-Ladestationen der **" + args[1] + "**:\n\n" + ladestationen.join("\n"))
		}
	} else if (interaction.commandName == "katwarn") {
		const res = await fetch("https://warnung.bund.de/api31/katwarn/mapData.json", {
			headers: {
				Accept: "application/json"
			}
		})
		const json = await res.json()

		const katwarn = []
		json.forEach(warning => {
			katwarn.push(warningIcon(warning.severity) + Discord.escapeMarkdown(warning.i18nTitle.de))
		})
		reply("Liste aller **Katwarn**-Meldungen:\n\n" + katwarn.join("\n"))
	} else if (interaction.commandName == "biwapp") {
		const res = await fetch("https://warnung.bund.de/api31/biwapp/mapData.json", {
			headers: {
				Accept: "application/json"
			}
		})
		const json = await res.json()

		const biwapp = []
		json.forEach(warning => {
			biwapp.push(warningIcon(warning.severity) + Discord.escapeMarkdown(warning.i18nTitle.de) + ", gestartet <t:" + Math.round((new Date(warning.startDate)).getTime() / 1000) + ":R>")
		})
		reply("Liste aller **Biwapp**-Meldungen:\n\n" + biwapp.join("\n"))
	} else if (interaction.commandName == "mowas") {
		const res = await fetch("https://warnung.bund.de/api31/mowas/mapData.json", {
			headers: {
				Accept: "application/json"
			}
		})
		const json = await res.json()

		const mowas = []
		json.forEach(warning => {
			if (warning.type == "Alert") mowas.push(
				warningIcon(warning.severity) + Discord.escapeMarkdown(warning.i18nTitle.de) +
				", gestartet <t:" + Math.round((new Date(warning.startDate)).getTime() / 1000) + ":R>"
			)
		})
		reply("Liste aller **Mowas**-Meldungen:\n\n" + mowas.join("\n"))
	} else if (interaction.commandName == "productwarn") {
		const body = {
			food: {
				rows: 500,
				sort: "publishedDate desc, title asc",
				start: 11,
				fq: [
					"publishedDate > 1630067654000"
				]
			},
			products: {
				rows: 500,
				sort: "publishedDate desc, title asc",
				start: 11,
				fq: [
					"publishedDate > 1630067654000"
				]
			}
		}
		const res = await fetch("https://lebensmittelwarnung.api.proxy.bund.dev/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged", {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				Authorization: "baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61",
				"Content-Type": "application/json",
				Accept: "application/json"
			}
		})
		const json = await res.json()

		const lebensmittelwarns = []
		const produktwarns = []
		json.response.docs.every(warning => {
			if (lebensmittelwarns.length >= 3 && produktwarns.length >= 3) return false

			if (warning._type == ".FoodWarning" && lebensmittelwarns.length < 3) lebensmittelwarns.push(
				"Name: " + warning.title + "\nWarnung: " + (warning.warning.length > 120 ? warning.warning.substring(0, 117) + "..." : warning.warning) +
				"\nVeröffentlicht: <t:" + Math.round(warning.publishedDate / 1000) + ":R>\nLink: <" + warning.link + ">"
			)
			else if (warning._type == ".ProductWarning" && produktwarns.length < 3) produktwarns.push(
				"Name: " + warning.title + "\nVeröffentlicht: <t:" + Math.round(warning.publishedDate / 1000) + ":R>\nZusatz: " +
				(warning.safetyInformation.hazard && warning.safetyInformation.injury ?
					warning.safetyInformation.hazard + ", " + warning.safetyInformation.injury : warning.safetyInformation.ordinance
				) +
				"\nLink: <" + warning.link + ">"
			)

			return true
		})
		reply("Es wurden **" + json.response.numFound + "** Einträge gefunden, je 3 Lebensmittel- und Produktwarnungen werden angezeigt:\n\n" +
			lebensmittelwarns.join("\n\n") + "\n\n---\n\n" + produktwarns.join("\n\n"))
	}
})

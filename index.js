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

function migrateSlashOptions(options) {
	for (let i = 0; i < options.length; i++) {
		if (options[i].options) options[i].options = migrateSlashOptions(options[i].options)
		if (options[i].type == "SUB_COMMAND") options[i].type = Discord.ApplicationCommandOptionType.Subcommand
		else if (options[i].type == "SUB_COMMAND_GROUP") options[i].type = Discord.ApplicationCommandOptionType.SubcommandGroup
		else if (options[i].type == "STRING") options[i].type = Discord.ApplicationCommandOptionType.String
		else if (options[i].type == "INTEGER") options[i].type = Discord.ApplicationCommandOptionType.Integer
		else if (options[i].type == "BOOLEAN") options[i].type = Discord.ApplicationCommandOptionType.Boolean
		else if (options[i].type == "USER") options[i].type = Discord.ApplicationCommandOptionType.User
		else if (options[i].type == "CHANNEL") options[i].type = Discord.ApplicationCommandOptionType.Channel
		else if (options[i].type == "ROLE") options[i].type = Discord.ApplicationCommandOptionType.Role
		else if (options[i].type == "MENTIONABLE") options[i].type = Discord.ApplicationCommandOptionType.Mentionable
		else if (options[i].type == "NUMBER") options[i].type = Discord.ApplicationCommandOptionType.Number
		else if (options[i].type == "ATTACHMENT") options[i].type = Discord.ApplicationCommandOptionType.Attachment
	}
	return options
}

bot.on("ready", async () => {
	bot.user.setPresence({activities: [{name: "Custom Status", state: "/help", type: Discord.ActivityType.Custom}]})
	console.log("Bot wurde gestartet .-.")

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
				type: "SUB_COMMAND",
				description: "Listet alle Autobahnen auf"
			},{
				name: "webcams",
				type: "SUB_COMMAND",
				description: "Listet alle Webcams einer Autobahn auf",
				options: [{
					name: "id",
					type: "STRING",
					description: "Der Name der Autobahn",
					required: true
				}]
			},{
				name: "warnings",
				type: "SUB_COMMAND",
				description: "Listet alle Warnungen einer Autobahn auf",
				options: [{
					name: "id",
					type: "STRING",
					description: "Der Name der Autobahn",
					required: true
				}]
			},{
				name: "sperrungen",
				type: "SUB_COMMAND",
				description: "Listet alle Sperrungen einer Autobahn auf",
				options: [{
					name: "id",
					type: "STRING",
					description: "Der Name der Autobahn",
					required: true
				}]
			},{
				name: "baustellen",
				type: "SUB_COMMAND",
				description: "Zeigt Baustellen auf einer Autobahn",
				options: [{
					name: "id",
					type: "STRING",
					description: "Der Name der Autobahn",
					required: true
				}]
			},{
				name: "rastplaetze",
				type: "SUB_COMMAND",
				description: "Zeigt Rastplätze auf einer Autobahn",
				options: [{
					name: "id",
					type: "STRING",
					description: "Der Name der Autobahn",
					required: true
				}]
			},{
				name: "ladestationen",
				type: "SUB_COMMAND",
				description: "Zeigt Elektro-Ladestationen auf einer Autobahn",
				options: [{
					name: "id",
					type: "STRING",
					description: "Der Name der Autobahn",
					required: true
				}]
			}]
		}
	]

	const migratedcommands = []
	commands.every(cmd => {
		const cmdcopy = cmd

		if (cmdcopy.options) cmdcopy.options = migrateSlashOptions(cmdcopy.options)

		migratedcommands.push(cmdcopy)
		return true
	})
	bot.application.commands.set(migratedcommands)
})

function warningIcon(severity) {
	if (severity == "Severe") return "‼️ "
	if (severity == "Minor") return "❗ "
}

const autobahnregex = new RegExp(/A\d{1,3}/g)
function checkAutobahn(string) {
	if (string.match(autobahnregex)) return true
	else return false
}

bot.on("interactionCreate", async interaction => {
	if (interaction.user.bot || interaction.channel.type == Discord.ChannelType.DM) return

	const reply = data => {
		if (typeof data == "string" && data.length > 2000) data = data.substring(0, 1997) + "..."
		interaction.reply(data)
	}

	if (interaction.commandName == "autobahn") {
		const args = [interaction.options.getSubcommand(), interaction.options.getString("id", false)]
		if (args[0] == "list") {
			const res = await fetch("https://verkehr.autobahn.de/o/autobahn", {
				headers: {
					Accept: "application/json"
				}
			})
			const json = await res.json()

			interaction.reply("Liste aller Autobahnen in Deutschland:\n\n" + json.roads.join(" "))
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
				rastplatze.push(rastplatz.title + ": " + rastplatz.description.join(", ").trim())
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
			if (warning.type == "Alert") mowas.push(warningIcon(warning.severity) + Discord.escapeMarkdown(warning.i18nTitle.de) + ", gestartet <t:" + Math.round((new Date(warning.startDate)).getTime() / 1000) + ":R>")
		})
		reply("Liste aller **Mowas**-Meldungen:\n\n" + mowas.join("\n"))
	} else if (interaction.commandName == "produktwarn") {
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
				(warning.safetyInformation.hazard && warning.safetyInformation.injury ? warning.safetyInformation.hazard + ", " + warning.safetyInformation.injury : warning.safetyInformation.ordinance) +
				"\nLink: <" + warning.link + ">"
			)

			return true
		})
		reply("Es wurden **" + json.response.numFound + "** Einträge gefunden, je 3 Lebensmittel- und Produktwarnungen werden angezeigt:\n\n" + lebensmittelwarns.join("\n\n") + "\n\n---\n\n" + produktwarns.join("\n\n"))
	}
})

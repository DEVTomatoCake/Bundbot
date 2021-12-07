const Discord = require("discord.js")
const bot = new Discord.Client({
	allowedMentions: {
		repliedUser: false,
		parse: ["users"]
	},
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES
	]
})
bot.login("TOKEN")
const fetch = require("node-fetch")
const prefix = "-"

bot.on("ready", async () => {
	bot.user.setPresence({activities: [{name: prefix + "help", type: "LISTENING"}]})
})

const help = [
	"`" + prefix + "list`\nZeigt eine Liste aller deutschen Autobahnen an",
	"`" + prefix + "listwebcams <Autobahn>`\nZeigt eine Liste aller Webcams auf einer Autobahn an",
	"`" + prefix + "listwarnings <Autobahn>`\nZeigt eine Liste aller Verkehrsmeldungen einer Autobahn an",
	"`" + prefix + "listbaustellen <Autobahn>`\nZeigt eine Liste aller Baustellen einer Autobahn an",
	"`" + prefix + "listsperrungen <Autobahn>`\nZeigt eine Liste aller Sperrungen einer Autobahn an",
	"`" + prefix + "listrastplätze <Autobahn>`\nZeigt eine Liste aller Rastplätze einer Autobahn an",
	"`" + prefix + "listladestationen <Autobahn>`\nZeigt eine Liste aller Ladestationen einer Autobahn an",
	"`" + prefix + "katwarn`\nZeigt alle Katwarn-Meldungen an",
	"`" + prefix + "biwapp`\nZeigt alle Biwapp-Meldungen an",
	"`" + prefix + "mowas`\nZeigt alle Mowas-Meldungen an",
	"`" + prefix + "produktwarn`\nZeigt Lebensmittel- und Produktwarnungen an"
]

function clean(text) {
	if (typeof text == "string") {
		text = text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`).replace(new RegExp(bot.token, "gi"), "")
	}
	return text
}

function warningIcon(severity) {
	if (severity == "Severe") return ":bangbang: "
	else if (severity == "Minor") return ":exclamation: "
}

const autobahnregex = new RegExp(/A\d{1,3}/g)
function checkAutobahn(string) {
	if (string.match(autobahnregex)) return true
	else return false
}

bot.on("messageCreate", async message => {
	if (message.author.bot) return
	if (message.webhookId) return
	if (message.channel.type == "DM") return
	if (!message.guild.available) return

	reply = data => {
		if (typeof data == "string" && data.length > 2000) data = data.substring(0, 1997) + "..."
		message.reply(data)
	}

	const botperms = message.channel.permissionsFor(message.guild.me)
	if (!botperms.has("VIEW_CHANNEL")) return
	if (!botperms.has("READ_MESSAGE_HISTORY")) return
	if (!botperms.has("SEND_MESSAGES")) return
	let messageArray = message.content.split(" ")
	let cmd = messageArray[0].toString().toLowerCase()
	let args = messageArray.slice(1)

	if (cmd == prefix + "help") message.reply(help.join("\n\n"))

	if (cmd == prefix + "list") {
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn")
		const json = await res.json()

		message.reply("Liste aller Autobahnen in Deutschland:\n\n" + json.roads.join(" "))
	}

	if (cmd == prefix + "listwebcams") {
		if (!checkAutobahn(args.join(" "))) return message.reply("Du musst eine gültige Autobahn angeben!")
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[0] + "/services/webcam")
		const json = await res.json()

		webcams = []
		json.webcam.forEach(webcam => {
			if (webcam.linkurl != "" && webcam.linkurl != "https://#") webcams.push(webcam.subtitle + ": " + webcam.linkurl)
		})
		reply("Liste aller Webcams der **" + args[0] + "**:\n\n" + webcams.join("\n"))
	}

	if (cmd == prefix + "listwarnings") {
		if (!checkAutobahn(args.join(" "))) return message.reply("Du musst eine gültige Autobahn angeben!")
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[0] + "/services/warning")
		const json = await res.json()

		warnings = []
		json.warning.forEach(warning => {
			warnings.push(warning.description.join(" "))
		})
		reply("Liste aller Verkehrsmeldungen der **" + args[0] + "**:\n\n" + warnings.join("\n"))
	}

	if (cmd == prefix + "listbaustellen") {
		if (!checkAutobahn(args.join(" "))) return message.reply("Du musst eine gültige Autobahn angeben!")
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[0] + "/services/roadworks")
		const json = await res.json()

		baustellen = []
		json.roadworks.forEach(roadworks => {
			baustellen.push(roadworks.description.join(" "))
		})
		reply("Liste aller Baustellen der **" + args[0] + "**:\n\n" + baustellen.join("\n"))
	}

	if (cmd == prefix + "listsperrungen") {
		if (!checkAutobahn(args.join(" "))) return message.reply("Du musst eine gültige Autobahn angeben!")
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[0] + "/services/closure")
		const json = await res.json()

		sperrungen = []
		json.closure.forEach(closure => {
			sperrungen.push(closure.description.join(" "))
		})
		reply("Liste aller Sperrungen der **" + args[0] + "**:\n\n" + sperrungen.join("\n"))
	}

	if (cmd == prefix + "listrastplätze") {
		if (!checkAutobahn(args.join(" "))) return message.reply("Du musst eine gültige Autobahn angeben!")
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[0] + "/services/parking_lorry")
		const json = await res.json()

		rastplatze = []
		json.parking_lorry.forEach(rastplatz => {
			rastplatze.push(rastplatz.title + ": " + rastplatz.description.join(", ").trim())
		})
		reply("Liste aller Rastplätze der **" + args[0] + "**:\n\n" + rastplatze.join("\n"))
	}

	if (cmd == prefix + "listladestationen") {
		if (!checkAutobahn(args.join(" "))) return message.reply("Du musst eine gültige Autobahn angeben!")
		const res = await fetch("https://verkehr.autobahn.de/o/autobahn/" + args[0] + "/services/electric_charging_stations")
		const json = await res.json()

		ladestationen = []
		json.electric_charging_stations.forEach(ladestation => {
			ladestationen.push(ladestation.description.join(" "))
		})
		if (ladestationen.length == 0) message.reply("Die **" + args[0] + "** hat keine elektrischen Ladestationen!")
		else reply("Liste aller Elektro-Ladestationen der **" + args[0] + "**:\n\n" + ladestationen.join("\n"))
	}

	if (cmd == prefix + "katwarn") {
		const res = await fetch("https://warnung.bund.de/api31/katwarn/mapData.json")
		const json = await res.json()

		katwarn = []
		json.forEach(warning => {
			katwarn.push(warningIcon(warning.severity) + Discord.Util.escapeMarkdown(warning.i18nTitle.de))
		})
		reply("Liste aller **Katwarn**-Meldungen:\n\n" + katwarn.join("\n"))
	}

	if (cmd == prefix + "biwapp") {
		const res = await fetch("https://warnung.bund.de/api31/biwapp/mapData.json")
		const json = await res.json()

		biwapp = []
		json.forEach(warning => {
			biwapp.push(warningIcon(warning.severity) + Discord.Util.escapeMarkdown(warning.i18nTitle.de) + ", gestartet <t:" + Math.round((new Date(warning.startDate)).getTime() / 1000) + ":R>")
		})
		reply("Liste aller **Biwapp**-Meldungen:\n\n" + biwapp.join("\n"))
	}

	if (cmd == prefix + "mowas") {
		const res = await fetch("https://warnung.bund.de/api31/mowas/mapData.json")
		const json = await res.json()

		mowas = []
		json.forEach(warning => {
			if (warning.type == "Alert") mowas.push(warningIcon(warning.severity) + Discord.Util.escapeMarkdown(warning.i18nTitle.de) + ", gestartet <t:" + Math.round((new Date(warning.startDate)).getTime() / 1000) + ":R>")
		})
		reply("Liste aller **Mowas**-Meldungen:\n\n" + mowas.join("\n"))
	}

	if (cmd == prefix + "produktwarn") {
		const body = {
		  	"food": {
			    "rows": 500,
			    "sort": "publishedDate desc, title asc",
			    "start": 11,
			    "fq": [
			      	"publishedDate > 1630067654000"
			    ]
			},
			"products": {
			    "rows": 500,
			    "sort": "publishedDate desc, title asc",
			    "start": 11,
			    "fq": [
			      	"publishedDate > 1630067654000"
			    ]
			}
		}
		const res = await fetch("https://lebensmittelwarnung.api.proxy.bund.dev/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged", {
			method: "post",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				"Authorization": "baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61"
			}
		})
		const json = await res.json()

		var lebensmittelwarns = []
		var produktwarns = []
		json.response.docs.every(warning => {
			if (lebensmittelwarns.length >= 3 && produktwarns.length >= 3) return false

			if (warning._type == ".FoodWarning" && lebensmittelwarns.length < 3) {
				lebensmittelwarns.push("Name: " + warning.title + "\nWarnung: " + (warning.warning.length > 120 ? warning.warning.substring(0, 117) + "..." : warning.warning) + "\nVeröffentlicht: <t:" + Math.round(warning.publishedDate / 1000) + ":R>\nLink: <" + warning.link + ">")
			} else if (warning._type == ".ProductWarning" && produktwarns.length < 3) {
				produktwarns.push("Name: " + warning.title + "\nVeröffentlicht: <t:" + Math.round(warning.publishedDate / 1000) + ":R>\nLink: <" + warning.link + ">")
			}

			return true
		})
		reply("Es wurden **" + json.response.numFound + "** Einträge gefunden, je 3 Lebensmittel- und Produktwarnungen werden angezeigt:\n\n" + lebensmittelwarns.join("\n\n") + "\n\n---\n\n" + produktwarns.join("\n\n"))
	}
})

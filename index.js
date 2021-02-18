/**
    Copyright (C) 2020 Avunia Takiya <avunia@takiya.cloud>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const fs 		= require("fs");
const path 		= require("path");
const discord 	= require("discord.js");
const nightingale = new discord.Client();

/* ================= */
/* Check environment */

/* Let's check if dotenv exists in the root since we NEED a bot token, if not, exit out */
try {
	require("dotenv").config({path: path.resolve(__dirname, ".env")});
} catch(err) {
	console.error(err);
	process.exit(1);
}

nightingale.configDefaults = {
	debug: false,
	name: "Nightingale",
	prefix: "n",
	volumeMod: 0.5
}

nightingale.recentExecuters = new Set();
nightingale.recentExecutersNotified = false;
nightingale.recentExecutersCooldown = 2000; //Cooldown in ms

/* Now check if we have an option file, if not, write defaults into a new file */
try {
	let configUpdated = false;
	nightingale.config = require("./config.json");
	/* Check if we need to add new config parameters to the file */
	for (const key in nightingale.configDefaults) {
		if(!(key in nightingale.config)) {
			nightingale.config[key] = nightingale.configDefaults[key];
			configUpdated = true;
		}
	}
	/* Write the new config now if anything changed */
	if (configUpdated) {
		fs.writeFile("./config.json", JSON.stringify(nightingale.config), function(err) {
			if (err) return console.error(err);
			console.log("Updated configuration file has been written successfully.");
		});
	}
} catch (err) {
	console.warn(err);
	console.log("Attempting to write a default config file...");
	fs.writeFileSync("./config.json", JSON.stringify(nightingale.configDefaults), function(err) {
		if (err) {
			console.error("Writing default config failed!");
			console.warn("Settling onto hardcoded defaults...");
			nightingale.config = nightingale.configDefaults;
			return console.error(err);
		}
		console.log("Default configuration file has been written successfully.");
	});
}

/* Now we read all existing commands and store them, ready to be used */
nightingale.commands = new discord.Collection();
nightingale.commandFiles = fs.readdirSync(path.normalize("./commands")).filter((file) => file.endsWith(".js"));

/* Iterate through every file in ./commands/ */
for (const file of nightingale.commandFiles) {
	/* Store the module object */
	const commands = require(`./commands/${file}`);
	/* Iterate through the module object */
	for (let key in commands) {
		/* Check if key is from the Prototype -- We only want direct properties */
		if (!commands.hasOwnProperty(key)) continue;

		/* Take command and add it to the client */
		const command = commands[key];
		nightingale.commands.set(command.name, command);
	}
}
/* Let's also sort them unicode-wise :) */
nightingale.commands.sort();

/* ============= */
/* Client events */

/* Are we in debug mode according to config? */
nightingale.on("debug", (info) => {
	if(nightingale.config.debug) console.log(info);
});

nightingale.on("ready", () => {
	/* Ready to rumble */
	console.log(`Logged in as ${nightingale.user.tag}!`);
	/* Let's set a silly status */
	if(nightingale.config.customStatus != null) {
		nightingale.user.setPresence({activity: {name: "birds.", type: "LISTENING"}}).catch(console.error);
	}
});

nightingale.on("message", async (msg) => {
	/* Check if message starts with prefix, is long enough, is not from another bot, and is in guild, no DMs! */
	if (!msg.content.startsWith(nightingale.config.prefix) || msg.content.length < 3 || msg.author.bot || !msg.guild) return;
	/* Check command cooldown. We do not want people spamming commands. */
	if (nightingale.recentExecuters.has(msg.author.id)) {
		if (!nightingale.recentExecutersNotified) {
			msg.channel.send(`Please wait ${nightingale.recentExecutersCooldown/1000} seconds between commands.`);
			nightingale.recentExecutersNotified = true;
			setTimeout(() => {
				nightingale.recentExecutersNotified = false;
			}, nightingale.recentExecutersCooldown);
		}
		return;
	}

	/* Split message into command and argument(s) */
	const args = msg.content.slice(nightingale.config.prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	/* Does the command exist? */
	const targetCommand = nightingale.commands.get(command)
		|| nightingale.commands.find(cmd => cmd.aliases
		&& cmd.aliases.includes(command));

	/* If it does not, exit here */
	if (!targetCommand) return;

	/* It apparently does - let's try to execute it */
	try {
		targetCommand.execute(msg, args);
		nightingale.recentExecuters.add(msg.author.id);
		setTimeout(() => {
			nightingale.recentExecuters.delete(msg.author.id);
		}, nightingale.recentExecutersCooldown);
	} catch (err) {
		console.error(err);
		msg.channel.send(err.message);
	}
});

/* Log into Discord */
nightingale.login(process.env.BOT_TOKEN);
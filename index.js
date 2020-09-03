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

/* Now check if we have an option file, if not, write defaults into a new file */
try {
	nightingale.config = require("./config.json");
} catch (err) {
	console.warn(err);
	const configDefault = {
		debug: false,
		name: "Nightingale",
		prefix: "n",
		volumeMod: 0.5
	}
	console.log("Attempting to write a default config file...");
	try {
		fs.writeFileSync("./config.json", JSON.stringify(configDefault));
	} catch (err) {
		console.error(`Writing default config failed! \n${err}`);
		console.warn("Settling onto hardcoded defaults...");
		nightingale.config = configDefault;
	}
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
	if(nightingale.config.debugging) console.log(info);
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
	} catch (err) {
		console.error(err);
		msg.channel.send(err.message);
	}
});

/* Log into Discord */
nightingale.login(process.env.BOT_TOKEN);
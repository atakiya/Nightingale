const reload = {
	name: "reload",
	description: "[Owner only] Reloads the bot commands from disk.",
	async execute(msg, _) {
		if(msg.author.id !== "107584883857035264") return;
		try {
			for (const file of msg.client.commandFiles) {
				delete require.cache[require.resolve(`./${file}`)];
				const cmds = require(`./${file}`);

				for (let key in cmds) {
					if (!cmds.hasOwnProperty(key)) continue;
			
					const cmd = cmds[key];
					msg.client.commands.set(cmd.name, cmd);
				}
			}
			msg.channel.send("\\✅ Commands reloaded!");
		} catch(err) {
			console.error(err);
			msg.channel.send(`\\❌ Error:\n${err.message}`);
		}
	}
}

module.exports = {
	reload: reload,
}
const Discord = require("discord.js");

const botHelp = {
	name: "help",
	description: "Shows the commands the bot supports.",
	aliases: ["commands"],
	async execute(msg, args) {
		const { commands } = msg.client;
		const embed = new Discord.MessageEmbed()
			.setColor("#ddddcc")
			.setTitle(`${msg.client.config.name} Help`);
		const data = [];
		data.push("__Following are all commands that this bot supports.__");
		data.push("Commands follow this pattern: `prefix command <required argument> [optional argument]`\n");
		commands.forEach(command => {
			data.push(`\`${msg.client.config.prefix} ${command.name + (command.usage?" "+command.usage:"")}\`: ${command.description}`);
		});
		const description = data.join("\n");
		embed.setDescription(description);
		msg.reply(embed);
	}
}

module.exports = {
	botHelp : botHelp,
}
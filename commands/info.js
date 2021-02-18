const Discord = require("discord.js");

const botAbout = {
	name: "about",
	description: "Information about this bot.",
	aliases: ["info"],
	async execute(msg, _) {
		const { commands } = msg.client;
		const embed = new Discord.MessageEmbed()
			.setColor("#ddddcc")
			.setTitle(`About ${msg.client.config.name}`);
		const data = [];
		data.push(`${msg.client.config.name} - An open-source Discord voicechat bot for all your audio needs.\n`);
		data.push("Sourcecode: https://github.com/Avunia/Nightingale");
		const description = data.join("\n");
		embed.setURL("https://github.com/Avunia/Nightingale");
		embed.setDescription(description);
		embed.setFooter(`By Avunia Takiya, ©2020-${new Date().getFullYear()}, Licensed under GNU AGPLv3`);
		msg.reply(embed);
	}
}

module.exports = {
	botAbout : botAbout,
}
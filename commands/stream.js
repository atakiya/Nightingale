const startStream = {
	name: "stream",
	description: "Binds the bot to a voice channel and starts playing a new stream.",
	usage: "<stream URL>",
	aliases: ["start", "play"],
	async execute(msg, args) {
		const arg = args[0];
		if (!arg) {
			return msg.channel.send("\\❌ Error: No stream url supplied.")
		}
		if (msg.member.voice.channel) {
			let dispatcher;
			try {
				const connection = await msg.member.voice.channel.join();
				dispatcher = connection.play(arg, {
					volume: msg.client.config.volumeMod * 0.20
				});
				msg.channel.send(`\\✅🎶 Connected to ${msg.member.voice.channel.name}, starting playback of \<${arg}\>`);
			} catch (err) {
				console.error(err);
				msg.channel.send(`\\❌ Error playing stream:\n${err.message}`);
			}

			dispatcher.on("finish", () => {
				console.log("Finished playing stream");
			});
		} else {
			msg.channel.send("\\❌ Error: Please join a voice channel first.");
		}
	}
}

const getSetStreamVolume = {
	name: "volume",
	description: "Gets or sets the volume of the current stream.",
	usage: "[volume in percent]",
	aliases: ["vol"],
	async execute(msg, args) {
		function getUserFriendlyVolume(fVolume) {
			return ((fVolume * 100) / msg.client.config.volumeMod);
		}
		function setFromUserFriendlyVolume(iVolume) {
			return ((iVolume * msg.client.config.volumeMod) / 100);
		}

		if(!msg.member.guild.me.voice.connection) {
			return msg.channel.send("\\❌\\🔊 Not playing anything currently!");
		}

		const dispatcher = msg.member.guild.me.voice.connection.dispatcher;
		if(args.length) {
			const arg = args[0];
			if(arg < 0 || arg > 100 || isNaN(arg)) {
				return msg.channel.send("\\❌\\🔊 Error: Volume has to be a number from 0 to 100!")
			}

			try {
				dispatcher.setVolume(setFromUserFriendlyVolume(arg));
				msg.channel.send(`\\✅\\🔊 Volume set to ${getUserFriendlyVolume(dispatcher.volume)}%`);
			} catch (err) {
				console.error(err);
				msg.channel.send(`\\❌\\🔊 Error:\n${err.message}`);
			}
		} else {
			msg.channel.send(`Current volume is ${getUserFriendlyVolume(dispatcher.volume)}%`);
		}
	}
}

const stopStream = {
	name: "stop",
	description: "Stops the current stream.",
	async execute(msg, _) {
		if(!msg.member.guild.me.voice.connection) {
			return msg.channel.send("\\❌ Not playing anything currently!")
		}
		const dispatcher = msg.member.guild.me.voice.connection.dispatcher;
		dispatcher.destroy();
	}
}

const pauseStream = {
	name: "pause",
	description: "Pauses the current stream.",
	async execute(msg, _) {
		if(!msg.member.guild.me.voice.connection) {
			return msg.channel.send("\\❌ Not playing anything currently!")
		}
		const dispatcher = msg.member.guild.me.voice.connection.dispatcher;
		dispatcher.pause();
		msg.channel.send("\\⏸ Stream paused.");
	}
}

const resumeStream = {
	name: "resume",
	description: "Resumes the current stream if paused.",
	async execute(msg, _) {
		if(!msg.member.guild.me.voice.connection) {
			return msg.channel.send("\\❌ Not playing anything currently!")
		}
		const dispatcher = msg.member.guild.me.voice.connection.dispatcher;
		dispatcher.resume();
		msg.channel.send("\\⏯ Stream resumed.");
	}
}

const disconnect = {
	name: "disconnect",
	description: "Disconnects the bot from the voice channel.",
	aliases: ["exit", "quit"],
	async execute(msg, _) {
		if(!msg.member.guild.me.voice.channel) return;

		const channel = msg.member.guild.me.voice.channel;
		channel.leave();
		msg.channel.send(`\\✅\\🔌 Disconnected from ${channel.name}.`);
	}
}

const nowPlaying = {
	name: "nowplaying",
	description: "Shows the URL of the currently playing stream.",
	aliases: ["np"],
	async execute(msg, _) {
		msg.channel.send("\\🎶 a");
	}
}
module.exports = {
	startStream : startStream,
	getSetStreamVolume : getSetStreamVolume,
	stopStream : stopStream,
	pauseStream : pauseStream,
	resumeStream : resumeStream,
	disconnect : disconnect,
	nowPlaying : nowPlaying,
}

const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

// key is server id, value is the playlist/queue of songs specific to that server.
const queue = new Map();

module.exports = {
	name: 'play',
	aliases: ['skip', 'stop', 'songname', 'pause', 'resume', 'songqueue'],
	guildOnly: true,
	description: 'Play a YouTube video in the specified voice channel.',
	async execute(message, args, cmd) {

		const vc = message.member.voice.channel;
		if(!vc) return message.channel.send('You need to be in a voice channel to play music.');
		const perms = vc.permissionsFor(message.client.user);
		if(!perms.has('CONNECT') || !perms.has('SPEAK')) return message.channel.send('I don\'t have the required permissions to join and/or speak in the voice channel.');
		const serverQueue = queue.get(message.guild.id);

		if(cmd === 'play') {
			if(!args.length) return message.channel.send('You need to include a YouTube song, playlist, or search query.');
			let song = {};
			if (ytdl.validateURL(args[0])) {
				// if given a valid link, queue video
				const songInfo = await ytdl.getInfo(args[0]);
				song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url };
			}
			else {
				const videoFinder = async (query) => {
					// return top result for the given search
					const videoResult = await ytSearch(query);
					return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
				};

				const video = await videoFinder(args.join(' '));
				if(video) {
					song = { title: video.title, url: video.url };
				}
				else {
					message.channel.send('There was an error finding the video.');
				}
			}
			// creating new playlist queue if none exists
			if(!serverQueue) {

				const newQueue = {
					songs: [],
					connection: null,
					voiceChannel: vc,
					textChannel: message.channel,
				};

				queue.set(message.guild.id, newQueue);
				newQueue.songs.push(song);
				try{
					const connect = await vc.join();
					newQueue.connection = connect;
					playVideo(message.guild.id, newQueue.songs[0]);
				}
				catch(error) {
					message.channel.send('There was an error, please try again.');
					queue.delete(message.guild.id);
				}
			}
			else {
				serverQueue.songs.push(song);
				return message.channel.send(`Queued: *${song.title}*.`);
			}
		}
		else if (cmd === 'skip') { skipSong(message, serverQueue); }
		else if (cmd === 'stop') { stop(message, serverQueue); }
		else if (cmd === 'songname') { songName(message, serverQueue); }
		else if (cmd === 'pause') { pause(message, serverQueue); }
		else if (cmd === 'resume') { resume(message, serverQueue); }
		else if (cmd === 'queue') { songqueue(message, serverQueue); }
	},

};
const playVideo = async (id, song) => {
	const songQueue = queue.get(id);
	// playlist is empty
	if(!song) {
		songQueue.voiceChannel.leave();
		queue.delete(id);
		return;
	}
	const stream = ytdl(song.url, { filter: 'audioonly' });
	songQueue.connection.play(stream, { seek: 0, volume: 0.15 })
		.on('finish', () => {
			songQueue.songs.shift();
			playVideo(id, songQueue.songs[0]);
		});
	await songQueue.textChannel.send(`Now Playing: *${song.title}*. \n ${song.url}`);
};

const stop = (message, serverQueue) => {
	if(check(message, serverQueue)) {
		serverQueue.songs = [];
		serverQueue.voiceChannel.leave();
	}
};

const skipSong = (message, serverQueue) => {
	if(check(message, serverQueue)) {
		message.channel.send('Song skipped.');
		serverQueue.connection.dispatcher.end();
	}
};

const songName = (message, serverQueue) => {
	if(check(message, serverQueue)) { message.channel.send(`Current song: ${serverQueue.songs[0].title}`); }
};

const pause = (message, serverQueue) => {
	if(check(message, serverQueue)) {
		message.channel.send('Song paused.');
		serverQueue.connection.dispatcher.pause();
	}
};

const resume = (message, serverQueue) => {
	if(check(message, serverQueue)) {
		message.channel.send('Song resumed.');
		playVideo(message.guild.id, serverQueue.songs[0]);
	}
};

const check = (message, serverQueue) => {
	if(!message.member.voice.channel) message.channel.send('You need to be in a voice channel to use this command.');
	if(!serverQueue) ('There are no songs in the queue.');
	return true;
};

const songqueue = (message, serverQueue) => {
	if(check(message, serverQueue)) {
		let ret = '';
		for(let i = 0; i < serverQueue.songs.length; i++) {
			ret += `${i}: ${serverQueue.songs[i].title}\n`;
		}
		message.channel.send(ret);
	}
};
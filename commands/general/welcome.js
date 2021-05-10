const mongo = require('../../mongo.js');
const welcomeSchema = require('../../schemas/welcometext-schema.js');
// key = serverid, [ channelID, text ]
const cache = {};

module.exports = {
	name: 'setwelcome',
	description: 'Sets a text welcome.',
	aliases: ['newUserJoined'],
	guildOnly: true,
	requiredPermissions: ['ADMINISTRATOR'],
	async execute(message, args, commandName, member) {

		if(commandName == 'newUserJoined') return onJoin(member);

		if(!message.member.hasPermission('ADMINISTRATOR')) {
			return;
		}
		if(args.length < 1) {
			message.channel.send('No welcome message specified.');
		}
		const text = args.join(' ');
		message.channel.send(text);
		cache[message.guild.id] = [message.channel.id, text];

		await mongo().then(async (mongoose) => {
			try {
				await welcomeSchema.findOneAndUpdate({ _id: message.guild.id }, { _id: message.guild.id, channelID: message.channel.id, text: text }, { upsert: true });
				message.channel.send('Welcome message set.');
			}
			finally {
				mongoose.connection.close();
			}
		});

	},
};

const onJoin = async (member) => {
	let data = cache[member.guild.id];
	if (!data) {
		console.log('fetching');
		await mongo().then(async (mongoose) => {
			try {
				const result = await welcomeSchema.findOne({ _id: member.guild.id });
				cache[member.guild.id] = data = [result.channelID, result.text];
			}
			finally {
				mongoose.connection.close();
			}
		});
	}
	const channelId = data[0];
	const text = data[1];
	const channel = member.guild.channels.cache.get(channelId);
	return channel.send(text.replace(/<@>/g, `<@${member.id}>`));
};

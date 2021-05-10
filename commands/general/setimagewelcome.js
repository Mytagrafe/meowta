const welcomeImageSchema = require('../../schemas/welcome-schema.js');
const mongo = require('../../mongo.js');
const cache = new Map();

const loadData = async () => {

	const results = await welcomeImageSchema.find();

	for (const result of results) {
		console.log(result);
		cache.set(result._id, result.channelID);
	}

};
loadData();

module.exports = {
	name: 'setimagewelcome',
	description: 'Sets welcome channel for image welcomes.',
	guildOnly: true,
	requiredPermissions: ['ADMINISTRATOR'],
	async execute(message) {

		await mongo().then(async (mongoose) => {
			try {
				await welcomeImageSchema.findOneAndUpdate({ _id: message.guild.id }, { _id: message.guild.id, channelID: message.channel.id }, { upsert: true });
				message.channel.send('Welcome channel set.');
			}
			finally {
				mongoose.connection.close();
			}
		});

		cache.set(message.guild.id, message.channel.id);
	},

};

module.exports.getChannelID = (guildId) => {
	return cache.get(guildId);
};
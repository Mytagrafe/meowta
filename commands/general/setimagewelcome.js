const welcomeImageSchema = require('../../schemas/welcome-schema.js');
const mongo = require('../../mongo.js');
const cache = new Map();

const loadData = async () => {

	const results = await welcomeImageSchema.find();

	for (const result of results) {
		console.log(result);
		if(result.image != null) {
			cache.set(result._id, [ result.channelID, result.image ]);
		}
		else { cache.set(result._id, [result.channelID, null]); }
	}

};
loadData();

module.exports = {
	name: 'setimagewelcome',
	description: 'Sets welcome channel for image welcomes.',
	guildOnly: true,
	requiredPermissions: ['ADMINISTRATOR'],
	async execute(message, args) {

		await mongo().then(async (mongoose) => {
			try {
				if(args.length > 0) {
					console.log('here');
					if (args[0].match(/\w+\.(jpg|jpeg|gif|png|tiff|bmp)$/gi)) {
						await welcomeImageSchema.findOneAndUpdate({ _id: message.guild.id }, { _id: message.guild.id, channelID: message.channel.id, image: args[0] }, { upsert: true });
					}
					else {
						return message.channel.send('Please set a valid image.');
					}
				}
				else {
					await welcomeImageSchema.findOneAndUpdate({ _id: message.guild.id }, { _id: message.guild.id, channelID: message.channel.id, image: null }, { upsert: true });
				}
				message.channel.send('Welcome channel set.');
			}
			finally {
				mongoose.connection.close();
			}
		});

		if(args.length > 0) {
			cache.set(message.guild.id, [ message.channel.id, args[0] ]);
		}
		else {cache.set(message.guild.id, [ message.channel.id, null ]);}
	},

};

module.exports.getChannelID = (guildId) => {
	return cache.get(guildId)[0];
};

module.exports.getChannelImage = (guildId) => {
	return cache.get(guildId)[1];
};
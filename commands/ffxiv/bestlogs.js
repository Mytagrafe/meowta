const { fflogs } = require('../../config.json');
const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
	name: 'bestlogs',
	description: 'Retrieves best logs for specified player from FFLogs.',
	async execute(message) {

		const questions = [
			'What character do you want to look up?',
			'What server?',
			'What region? (NA, EU, JP)',
			'Ranking? (Today or Historical)',
		];

		let counter = 0;
		const filter = (m) => m.author.id === message.author.id;
		const collector = new Discord.MessageCollector(message.channel, filter, { max: questions.length, time: 1000 * 30 });
		message.channel.send(questions[counter++]);
		const data = [];

		collector.on('collect', m => {
			if(counter < questions.length) {
				m.channel.send(questions[counter++]);
			}
		});

		collector.on('end', collected => {
			if(collected.size < questions.length) {
				return message.channel.send('You didn\'t answer one or more of the prompts correctly. Try again.');
			}
			collected.forEach((value) => {
				data.push(value.content);
			});
			try {
				grabLogs(data, message);
			}
			catch (err) {
				message.channel.send(err);
			}
		});
	},
};

const grabLogs = async (data, message) => {
	const zone = 38;
	let fightNum = 73;
	const fights = 5;
	const percentiles = [];
	data[0] = data[0].replace(' ', '%20');
	console.log(data);
	message.channel.send(`https://www.fflogs.com/v1/rankings/character/${data[0]}/${data[1]}/${data[2]}?zone=${zone}&encounter=${fightNum}&metric=rdps&partition=1&timeframe=${data[3]}&api_key=${fflogs}`);

	for(let i = 0; i < fights; i++) {
		let max = 0;
		let fightName = '';
		let job = '';
		await axios.get(`https://www.fflogs.com/v1/rankings/character/${data[0]}/${data[1]}/${data[2]}?zone=${zone}&encounter=${fightNum}&metric=rdps&partition=1&timeframe=${data[3]}&api_key=${fflogs}`)
			.then((res) =>{
				fightName = res.data[0].encounterName;
				for(let j = 0; j < res.data.length; j++) {
					if(max < res.data[j].percentile) {
						max = res.data[j].percentile;
						job = res.data[j].spec;
					}
					console.log(res.data[j].percentile);
					console.log(`Max: ${max}`);
					console.log(`Fight Name: ${fightName}`);
					console.log(`Job: ${job}`);
				}
			}).catch((err) => {
				console.log(err);
			});
		// axios.get(`https://www.fflogs.com/v1/rankings/character/${data[0]}/${data[1]}/${data[2]}?zone=${zone}&encounter=${fightNum}&metric=rdps&timeframe=${data[3]}&api_key=${fflogs}`)
		// 	.then((res) =>{
		// 		fightName = res.data[0].encounterName;
		// 		for(let j = 0; j < res.data.length; j++) {
		// 			if(max < res.data[j].percentile) {
		// 				max = res.data[j].percentile;
		// 				job = res.data[j].spec;
		// 			}
		// 		}
		// 	}).catch((error) => {
		// 		throw 'That character is private, or there\'s something wrong with the FFLogs API. Please try again later if your selected character isn\'t private!';
		// 	});
		job.replace(/\s/g, '');
		console.log(`${fightName} max: ${max}`);
		// const ayy = message.client.emojis.cache.find(emoji => emoji.name === `${job}`);
		const struc = {
			val: max,
			name: fightName,
			job: job,
		};
		console.log(struc);
		percentiles.push(struc);
		fightNum++;
	}

	console.log(percentiles[0]);
	const embed = new Discord.MessageEmbed()
		.setAuthor('xd')
		.setColor('#dea5a4')
		.setDescription('Top logs for Eden\'s Promise.')
		.addFields(
			{ name: `**${percentiles[0][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
			{ name: `**${percentiles[1][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
			{ name: `**${percentiles[2][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
			{ name: `**${percentiles[3][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
			{ name: `**${percentiles[4][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` })
		.setTimestamp();
	message.channel.send(embed);
};

// const sendEmbed = (percentiles, message) => {
// 	console.log(percentiles[0]);
// 	const embed = new Discord.MessageEmbed()
// 		.setAuthor('xd')
// 		.setColor('#dea5a4')
// 		.setDescription('Top logs for Eden\'s Promise.')
// 		.addFields(
// 			{ name: `**${percentiles[0][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
// 			{ name: `**${percentiles[1][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
// 			{ name: `**${percentiles[2][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
// 			{ name: `**${percentiles[3][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` },
// 			{ name: `**${percentiles[4][2]}**`, value: `${percentiles[0][1]} ${percentiles[0][0]}` })
// 		.setTimestamp();
// 	message.channel.send(embed);
// };
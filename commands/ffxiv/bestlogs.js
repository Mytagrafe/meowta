const { fflogs } = require('../../config.json');
const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
	name: 'bestlogs',
	description: 'Retrieves best logs for specified player from FFLogs.',
	execute(message, args) {
		const questions = [
			'What character do you want to look up?',
			'What server?',
			'What region? (NA, EU, JP)',
			'Ranking? (Today or Historical)',
		];

		let counter = 0;
		const data = [];
		if(args.length === 5) {
			data.push(args[0] + '%20' + args[1]);
			data.push(args[2]);
			data.push(args[3]);
			data.push(args[4]);
			grabLogs(data, message).then().catch((err) => {
				message.channel.send(err);
			});
		}
		else {
			const filter = (m) => m.author.id === message.author.id;
			const collector = new Discord.MessageCollector(message.channel, filter, { max: questions.length, time: 1000 * 30 });
			message.channel.send(questions[counter++]);
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
				grabLogs(data, message).then().catch((err) => {
					message.channel.send(err);
				});
			});
		}
	},
};

const grabLogs = async (data, message) => {
	const zone = 38;
	const fights = 5;
	const percentiles = [];
	const maxParse = [];
	let fightNum = 73;
	data[0] = data[0].replace(' ', '%20');

	for(let i = 0; i < fights; i++, fightNum++) {
		try{
			const [firstRes, secondRes] = await Promise.all([
				axios.get(`https://www.fflogs.com/v1/rankings/character/${data[0]}/${data[1]}/${data[2]}?zone=${zone}&encounter=${fightNum}&metric=rdps&partition=1&timeframe=${data[3]}&api_key=${fflogs}`),
				axios.get(`https://www.fflogs.com/v1/rankings/character/${data[0]}/${data[1]}/${data[2]}?zone=${zone}&encounter=${fightNum}&metric=rdps&timeframe=${data[3]}&api_key=${fflogs}`),
			]);
			percentiles.push([ firstRes, secondRes ]);
		}
		catch (err) {
			throw 'Something went wrong. Make sure you\'ve entered the correct information. Or, try again later.';
		}
	}
	for(let i = 0; i < fights; i++) {
		let max = 0;
		let job = '';
		for(let j = 0; j < percentiles[i][0].data.length; j++) {
			if(percentiles[i][0].data.length > 0) {
				if(max < percentiles[i][0].data[j].percentile) {
					max = percentiles[i][0].data[j].percentile;
					job = percentiles[i][0].data[j].spec;
				}
			}
			else {
				job = 'No clears.';
			}
		}
		for(let j = 0; j < percentiles[i][1].data.length; j++) {
			if(percentiles[i][1].data.length > 0) {
				if(max < percentiles[i][1].data[j].percentile) {
					max = percentiles[i][1].data[j].percentile;
					job = percentiles[i][1].data[j].spec;
				}
			}
		}
		job.replace(/\s/g, '');
		maxParse.push([ max, job ]);
	}
	const embed = new Discord.MessageEmbed()
		.setAuthor('Eden\'s Promise')
		.setColor('#dea5a4')
		.setThumbnail('https://assets.rpglogs.com/img/ff/zones/zone-38.png')
		.setDescription('Top logs for Eden\'s Promise.')
		.addFields(
			{ name: '**Cloud of Darkness**', value: `${maxParse[0][1]} ${maxParse[0][0]}` },
			{ name: '**Shadowkeeper**', value: `${maxParse[1][1]} ${maxParse[1][0]}` },
			{ name: '**Fatebringer**', value: `${maxParse[2][1]} ${maxParse[2][0]}` },
			{ name: '**Eden\'s Promise**', value: `${maxParse[3][1]} ${maxParse[3][0]}` },
			{ name: '**Oracle of Darkness**', value: `${maxParse[4][1]} ${maxParse[4][0]}` })
		.setTimestamp();
	message.channel.send(embed);
};
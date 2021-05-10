const Discord = require('discord.js');

module.exports = {
	name: 'userinfo',
	description: 'Displays info about a user.',
	execute(message) {

		// no additional users mentioned
		if(!message.mentions.users.size) {
			const embed = new Discord.MessageEmbed();
			const url = message.author.avatarURL();

			embed.setTitle(`${message.author.tag}`);
			embed.setImage(url);
			embed.setColor('#dea5a4');
			embed.setThumbnail(url);
			embed.addFields(
				{ name: 'ID:', value: `${message.author.id}`, inline: true },
				{ name: 'Date Created:', value: `${message.author.createdAt}`, inline: true },
				{ name: 'Nickname:', value: `${message.author.username}`, inline: true });
			embed.setTimestamp();

			return message.channel.send(embed);
		}

		// one or more users mentioned along with command
		// return userinfo for all mentioned users
		message.mentions.users.map (user => {
			const url = user.avatarURL();
			const embed = new Discord.MessageEmbed()
				.setTitle(`${user.username}`)
				.setImage(url)
				.setThumbnail(url)
				.setColor('#dea5a4')
				.addFields(
					{ name: 'ID:', value: `${user.id}`, inline: true },
					{ name: 'Date Created:', value: `${user.createdAt}`, inline: true },
					{ name: 'Discord Username:', value: `${user.tag}`, inline: true })
				.setTimestamp();


			message.channel.send(embed);
		});


	},
};
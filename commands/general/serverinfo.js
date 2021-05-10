const Discord = require('discord.js');

module.exports = {
	name: 'serverinfo',
	description: 'Displays info about this server.',
	guildOnly: true,
	execute(message) {

		// grab icon and banner
		const icon = message.guild.iconURL();
		const banner = message.guild.bannerURL();

		const embed = new Discord.MessageEmbed()
			.setAuthor('Meowta', 'https://cdn.discordapp.com/avatars/828915753624272956/e3b722cf1962115d394fa13ded015bd7.webp')
			.setColor('#dea5a4')
			.setTitle(`${message.guild.name}`)
			.setDescription('Server Information')
			.setThumbnail(icon)
			.setImage(banner)
			.addFields(
				{ name: 'Region', value: `${message.guild.region}`, inline: true },
				{ name: 'ID:', value: `${message.guild.id}`, inline: true },
				{ name: 'Nitro boosts:', value: `${message.guild.premiumSubscriptionCount}`, inline: true },
				{ name: 'Members:', value: `${message.guild.memberCount}`, inline: true },
				{ name: 'Date Created:', value: `${message.guild.createdAt}`, inline: true },
				{ name: 'Owner:', value: `${message.guild.owner}`, inline: true })
			.setTimestamp()
			.setFooter('Server information', icon);

		message.channel.send(embed);
	},
};
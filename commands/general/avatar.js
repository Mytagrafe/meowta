module.exports = {
	name: 'avatar',
	description: 'Get avatar of tagged user(s), or your own avatar if no user is specified.',
	execute(message) {

		// no user mentioned
		if (!message.mentions.users.size) {
			return message.channel.send(`Your avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
		}

		// return all mentioned users' avatars
		const avatarList = message.mentions.users.map(user => {
			return `${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`;
		});

		message.channel.send(avatarList);
	},
};
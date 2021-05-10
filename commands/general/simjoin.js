module.exports = {
	requiredPermissions: ['ADMINISTRATOR'],
	name: 'simjoin',
	guildOnly: true,
	execute(message) {
		message.client.emit('guildMemberAdd', message.member);
	},
};
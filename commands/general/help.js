const { prefix } = require('../../config.json');

module.exports = {
	name: 'help',
	description: 'Lists all commands, or displays help about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		// ...
	},
};
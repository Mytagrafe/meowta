const fs = require ('fs');
const Discord = require('discord.js');
const{ prefix, token } = require('./config.json');
const mongo = require('./mongo.js');
const welcome = require('./commands/general/welcome.js');
const image = require('./commands/general/imagewelcome.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

// parsing commands folders
for (const folder of commandFolders) {
	console.log(folder);
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}
client.once('ready', async () => {
	console.log('Ready!');

	await mongo().then(mongoose => {
		try {
			console.log('Connected to mongo');
		}
		finally {
			// mongoose.connection.close();
		}
	});
});

client.on('message', message => {

	client.user.setActivity('being sad');

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	console.log(commandName);

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;
	if (command.args && !args.length) return message.channel.send(`${commandName} requires argument(s).`);

	try{
		if (command.guildOnly && message.channel.type === 'dm') {
			return message.reply('I can\'t execute that command inside of a DM.');
		}
		if (command.requiredPermissions == 'ADMINISTRATOR') {
			if(!message.member.hasPermission('ADMINISTRATOR')) {
				message.channel.send('You need to be an administrator to use that command.');
				return;
			}
		}
		command.execute(message, args, commandName);
	}
	catch(error) {
		console.error(error);
		message.reply('There was an error when trying to execute that command. Check your spelling and syntax!');
	}
});

client.on('guildMemberAdd', (member) => {
	image.execute(client, member);
	welcome.execute('', [], 'newUserJoined', member);
});

client.login(token);
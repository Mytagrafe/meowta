const Canvas = require('canvas');
const { MessageAttachment } = require ('discord.js');
const { getChannelID } = require('./setimagewelcome.js');

module.exports = {
	async execute(client, member) {

		console.log('got here');
		const channelID = getChannelID(member.guild.id);
		if(!channelID) { return; }
		const channel = member.guild.channels.cache.get(channelID);
		if(!channel) { return; }

		const canvas = Canvas.createCanvas(750, 400);
		const context = canvas.getContext('2d');

		const background = await Canvas.loadImage('https://i.imgur.com/HNqZxqy.png');

		let x = 0;
		let y = 0;
		context.drawImage(background, x, y, canvas.width, canvas.height);

		const pic = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));
		x = 25;
		y = 100;
		context.drawImage(pic, x, y, 200, 200);
		context.strokeStyle = '#000000';
		context.lineWidth = 5;
		context.strokeRect(24, 99, 201, 201);
		context.fillStyle = '#000000';
		context.font = '60px sans-serif';
		let text = `Welcome to ${member.guild.name}, ${member.user.tag}!`;
		context.fillText(text, x + 126, 150);

		const attachment = new MessageAttachment(canvas.toBuffer());
		channel.send('', attachment);

	},
};

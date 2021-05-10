const axios = require('axios');

// const queue = new Map();

module.exports = {
	name: 'cat',
	description: 'Get a random picture of a cat.',
	async execute(message) {

		axios
			.get('https://api.thecatapi.com/v1/images/search')
			.then((res) => {
				message.channel.send(res.data[0].url);
			});


	},

};


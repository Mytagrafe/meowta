const mongoose = require('mongoose');

const requiredString = {
	type: String,
	required: true,
};
const welcomeSchema = new mongoose.Schema({
	// server ID
	_id: requiredString,
	channelID: requiredString,
	text: requiredString,
});

module.exports = mongoose.model('welcome-text', welcomeSchema);
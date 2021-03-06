const mongoose = require('mongoose');

const requiredString = {
	type: String,
	required: true,
};
const welcomeImageSchema = new mongoose.Schema({
	// server ID
	_id: requiredString,
	channelID: requiredString,
	image: String,
});
module.exports = mongoose.model('welcome-canvas', welcomeImageSchema);
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
.setName("queue")
.setDescription("Create queue entry"),

async execute(interaction) {
await interaction.reply("Queue system active (wire UI next step)");
}
};

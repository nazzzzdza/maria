const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Open ticket panel"),

  async execute(interaction) {
    await interaction.reply("Panel works");
  }
};

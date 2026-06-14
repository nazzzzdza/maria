const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Ticket panel"),

  async execute(interaction) {

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Open a ticket")
        .addOptions([
          { label: "Buying", value: "buying" },
          { label: "Linking", value: "linking" }
        ])
    );

    return interaction.reply({
      content: "Ticket panel",
      components: [row]
    });
  }
};

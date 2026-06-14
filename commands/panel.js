const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Open ticket panel"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Panel")
      .setDescription("Select a category below to open a ticket")
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choose a ticket type")
        .addOptions(
          { label: "Buying", value: "buying" },
          { label: "Linking", value: "linking" }
        )
    );

    return interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};

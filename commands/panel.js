const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Open ticket panel"),

  async execute(interaction) {

    // Optional: restrict panel usage to staff only
    const STAFF_ROLE_ID = "1500489431918837861";

    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({
        content: "❌ You cannot use this command.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Tickets")
      .setDescription("Select a category below to open a ticket")
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choose a ticket type")
        .addOptions(
          {
            label: "Buying",
            value: "buying",
            description: "Order a product / commission"
          },
          {
            label: "Linking",
            value: "linking",
            description: "Link / support request"
          }
        )
    );

    return interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};

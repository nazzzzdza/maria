const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const QUEUE_CHANNEL_ID = "1507132141316603955";
const STAFF_ROLE_ID = "1500489431918837861";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Create queue order"),

  async execute(interaction) {

    const user = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("🎹 Order Queue")
      .setDescription(`Order for <@${user.id}>`)
      .addFields(
        { name: "Buying", value: "txt", inline: false },
        { name: "Theme", value: "txt", inline: false },
        { name: "Style", value: "txt", inline: false },
        { name: "MOP", value: "txt", inline: false },
        { name: "Notes", value: "txt", inline: false }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("noted")
        .setLabel("Noted")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("processing")
        .setLabel("Processing")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("completed")
        .setLabel("Completed")
        .setStyle(ButtonStyle.Success)
    );

    const channel = await interaction.client.channels.fetch(QUEUE_CHANNEL_ID);

    await channel.send({
      content: `<@&${STAFF_ROLE_ID}>`,
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: "Queue added",
      ephemeral: true
    });
  }
};

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

const CATEGORY_ID = "1387525349797269666";
const STAFF_ROLE_ID = "1500489431918837861";
const BOT_ROLE_ID = "1439161768223182859";

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {

    // COMMANDS
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      return cmd.execute(interaction, client);
    }

    // PANEL DROPDOWN → CREATE TICKET
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

      const type = interaction.values[0];
      const user = interaction.user;

      const channel = await interaction.guild.channels.create({
        name: `${type}-${user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          {
            id: STAFF_ROLE_ID,
            allow: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: BOT_ROLE_ID,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close")
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: `Ticket opened for <@${user.id}>`,
        components: [row]
      });

      return interaction.reply({
        content: `Ticket created: ${channel}`,
        ephemeral: true
      });
    }

    // CLOSE BUTTON → CONFIRM
    if (interaction.isButton() && interaction.customId === "close_ticket") {

      return interaction.reply({
        content: "Are you sure?",
        ephemeral: true,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("close_yes")
              .setLabel("Yes")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId("close_no")
              .setLabel("No")
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      });
    }

    if (interaction.customId === "close_yes") {
      return interaction.channel.delete().catch(() => {});
    }

    if (interaction.customId === "close_no") {
      return interaction.reply({
        content: "Cancelled",
        ephemeral: true
      });
    }

    // QUEUE BUTTONS
    if (interaction.customId === "noted") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) return;
      return interaction.reply({ content: "marked as noted", ephemeral: true });
    }

    if (interaction.customId === "processing") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) return;
      return interaction.reply({ content: "processing order", ephemeral: true });
    }

    if (interaction.customId === "completed") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) return;

      const userMention = interaction.message.content?.match(/<@(\d+)>/);

      if (userMention) {
        const userId = userMention[1];
        await interaction.channel.send(`your order has been completed <@${userId}>`);
      }

      return interaction.reply({ content: "marked as completed", ephemeral: true });
    }
  }
};

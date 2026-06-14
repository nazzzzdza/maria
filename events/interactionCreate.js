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

    // COMMAND HANDLER
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      return cmd.execute(interaction, client);
    }

    // DROPDOWN → TICKET CREATE (SAFE)
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

      await interaction.deferReply({ ephemeral: true });

      const type = interaction.values[0];
      const user = interaction.user;

      try {
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
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
              ]
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
          content: `🎫 Ticket opened for <@${user.id}>`,
          components: [row]
        });

        return interaction.editReply({
          content: `Ticket created: ${channel}`
        });

      } catch (err) {
        console.error("TICKET ERROR:", err);

        return interaction.editReply({
          content: "❌ Failed to create ticket. Check bot permissions."
        });
      }
    }

    // CLOSE BUTTON
    if (interaction.isButton() && interaction.customId === "close_ticket") {

      return interaction.reply({
        content: "Are you sure you want to close this ticket?",
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
  }
};

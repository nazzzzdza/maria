const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType
} = require("discord.js");

const CATEGORY_ID = "1387525349797269666";
const STAFF_ROLE_ID = "1500489431918837861";

module.exports = {
name: "interactionCreate",

async execute(interaction, client) {


// COMMAND HANDLER
if (interaction.isChatInputCommand()) {
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  return cmd.execute(interaction, client);
}

// TICKET DROPDOWN
if (
  interaction.isStringSelectMenu() &&
  interaction.customId === "ticket_select"
) {

  await interaction.deferReply({ ephemeral: true });

  try {

    const type = interaction.values[0];
    const user = interaction.user;

    const channel = await interaction.guild.channels.create({
      name: `${type}-${user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      parent: CATEGORY_ID
    });

    // Hide from everyone
    await channel.permissionOverwrites.edit(
      interaction.guild.id,
      {
        ViewChannel: false
      }
    );

    // Ticket creator
    await channel.permissionOverwrites.edit(
      user.id,
      {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      }
    );

    // Staff role
    await channel.permissionOverwrites.edit(
      STAFF_ROLE_ID,
      {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close")
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: "please type `.text` to start your order",
      components: [row]
    });

    await interaction.editReply({
      content: `Ticket created: ${channel}`
    });

  } catch (err) {

    console.error("TICKET ERROR:", err);

    await interaction.editReply({
      content: "❌ Failed to create ticket."
    }).catch(() => {});
  }

  return;
}

// CLOSE BUTTON
if (
  interaction.isButton() &&
  interaction.customId === "close_ticket"
) {

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

// CONFIRM DELETE
if (
  interaction.isButton() &&
  interaction.customId === "close_yes"
) {

  await interaction.reply({
    content: "Closing ticket...",
    ephemeral: true
  });

  return interaction.channel.delete().catch(() => {});
}

// CANCEL DELETE
if (
  interaction.isButton() &&
  interaction.customId === "close_no"
) {

  return interaction.reply({
    content: "Cancelled",
    ephemeral: true
  });
}

}
};

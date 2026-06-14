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

```
// COMMAND HANDLER
if (interaction.isChatInputCommand()) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  return command.execute(interaction, client);
}

// TICKET PANEL
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

  const type = interaction.values[0];
  const user = interaction.user;

  const channel = await interaction.guild.channels.create({
    name: (type + "-" + user.username).toLowerCase(),
    type: ChannelType.GuildText,
    parent: CATEGORY_ID,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
      { id: BOT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] }
    ]
  });

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

  return interaction.reply({
    content: "Ticket created",
    ephemeral: true
  });
}

// CLOSE BUTTON
if (interaction.isButton() && interaction.customId === "close_ticket") {

  return interaction.reply({
    content: "Are you sure?",
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
    ],
    ephemeral: true
  });
}

if (interaction.customId === "close_yes") {
  return interaction.channel.delete().catch(() => {});
}

if (interaction.customId === "close_no") {
  return interaction.reply({ content: "Cancelled", ephemeral: true });
}
```

}
};

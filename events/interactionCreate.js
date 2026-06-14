const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
PermissionsBitField,
ChannelType
} = require("discord.js");

const CATEGORY_ID = "1387525349797269666";
const STAFF_ROLE_ID = "1500489431918837861";
const QUEUE_CHANNEL_ID = "1507132141316603955";

module.exports = {
name: "interactionCreate",

async execute(interaction, client) {


// ===================== COMMANDS =====================
if (interaction.isChatInputCommand()) {
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  return cmd.execute(interaction, client);
}

// ===================== TICKET CREATE =====================
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

  await interaction.deferReply({ ephemeral: true });

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
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      }
    ]
  });

  // Welcome embed
  const embed = new EmbedBuilder()
    .setColor("#1c1d23")
    .setDescription(


`.　  ✦　  ˚  　⊹  　˖　  ❜
(˶•ᴗ•)⌒)ↄ   ❥୧    welcome

_ _      ˚❒ ⠀ ⤷☒⠀⠀𖥨🍓
please submit your order below

_ _      staff will review it
before it is added to the queue

.　  ✦　  ˚  　⊹  　˖　  ❜`
);


  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("submit_order")
      .setLabel("submit order")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("close")
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    content: `<@${user.id}>`,
    embeds: [embed],
    components: [row]
  });

  return interaction.editReply({
    content: `ticket created: ${channel}`
  });
}

// ===================== SUBMIT ORDER MODAL =====================
if (interaction.isButton() && interaction.customId === "submit_order") {

  const modal = new ModalBuilder()
    .setCustomId("order_modal")
    .setTitle("order form");

  const buying = new TextInputBuilder()
    .setCustomId("buying")
    .setLabel("buying")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const theme = new TextInputBuilder()
    .setCustomId("theme")
    .setLabel("theme")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const style = new TextInputBuilder()
    .setCustomId("style")
    .setLabel("style")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const mop = new TextInputBuilder()
    .setCustomId("mop")
    .setLabel("mop")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const notes = new TextInputBuilder()
    .setCustomId("notes")
    .setLabel("notes")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(buying),
    new ActionRowBuilder().addComponents(theme),
    new ActionRowBuilder().addComponents(style),
    new ActionRowBuilder().addComponents(mop),
    new ActionRowBuilder().addComponents(notes)
  );

  return interaction.showModal(modal);
}

// ===================== MODAL SUBMIT =====================
if (interaction.isModalSubmit() && interaction.customId === "order_modal") {

  const buying = interaction.fields.getTextInputValue("buying");
  const theme = interaction.fields.getTextInputValue("theme");
  const style = interaction.fields.getTextInputValue("style");
  const mop = interaction.fields.getTextInputValue("mop");
  const notes = interaction.fields.getTextInputValue("notes") || "none";

  const embed = new EmbedBuilder()
    .setColor("#1c1d23")
    .setDescription(


`order summary

buying: ${buying}
theme: ${theme}
style: ${style}
mop: ${mop}
notes: ${notes}

status: pending approval`
);


  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("edit_order")
      .setLabel("edit")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("approve_order")
      .setLabel("approve")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("close")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.channel.send({
    embeds: [embed],
    components: [row]
  });

  return interaction.reply({
    content: "order submitted",
    ephemeral: true
  });
}

// ===================== EDIT ORDER =====================
if (interaction.isButton() && interaction.customId === "edit_order") {
  return interaction.showModal(
    new ModalBuilder()
      .setCustomId("order_modal")
      .setTitle("edit order")
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("buying")
            .setLabel("buying")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("theme")
            .setLabel("theme")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("style")
            .setLabel("style")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("mop")
            .setLabel("mop")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("notes")
            .setLabel("notes")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        )
      )
  );
}

// ===================== APPROVE ORDER =====================
if (interaction.isButton() && interaction.customId === "approve_order") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({
      content: "you cannot approve orders",
      ephemeral: true
    });
  }

  const queueChannel = await interaction.guild.channels.fetch(QUEUE_CHANNEL_ID);

  await queueChannel.send({
    content: `new order from ${interaction.user}`,
    embeds: interaction.message.embeds
  });

  return interaction.update({
    content: "approved and sent to queue",
    components: []
  });
}

// ===================== CLOSE =====================
if (interaction.isButton() && interaction.customId === "close_ticket") {

  return interaction.reply({
    content: "are you sure?",
    ephemeral: true,
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_yes")
          .setLabel("yes")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("close_no")
          .setLabel("no")
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
    content: "cancelled",
    ephemeral: true
  });
}


}
};

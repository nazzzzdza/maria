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


if (interaction.isChatInputCommand()) {
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  return cmd.execute(interaction, client);
}

// ================= PANEL =================
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

  await interaction.deferReply({ ephemeral: true });

  const type = interaction.values[0];
  const user = interaction.user;

  const channel = await interaction.guild.channels.create({
    name: `${type}-${user.username}`.toLowerCase(),
    type: ChannelType.GuildText,
    parent: CATEGORY_ID,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
    ]
  });

  const embed = new EmbedBuilder()
    .setColor("#1c1d23")
    .setDescription("ticket opened. use submit order below");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("submit_order").setLabel("submit order").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("close_ticket").setLabel("close").setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    content: `<@${user.id}>`,
    embeds: [embed],
    components: [row]
  });

  return interaction.editReply({ content: `ticket created: ${channel}` });
}

// ================= MODAL OPEN =================
if (interaction.isButton() && interaction.customId === "submit_order") {

  const modal = new ModalBuilder()
    .setCustomId("order_modal")
    .setTitle("order form");

  const fields = [
    { id: "buying", label: "buying" },
    { id: "theme", label: "theme" },
    { id: "style", label: "style" },
    { id: "mop", label: "mop" },
    { id: "notes", label: "notes", optional: true }
  ];

  const rows = fields.map(f =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(f.id)
        .setLabel(f.label)
        .setStyle(f.id === "notes" ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(!f.optional)
    )
  );

  modal.addComponents(...rows);

  return interaction.showModal(modal);
}

// ================= MODAL SUBMIT =================
if (interaction.isModalSubmit() && interaction.customId === "order_modal") {

  const data = {
    buying: interaction.fields.getTextInputValue("buying"),
    theme: interaction.fields.getTextInputValue("theme"),
    style: interaction.fields.getTextInputValue("style"),
    mop: interaction.fields.getTextInputValue("mop"),
    notes: interaction.fields.getTextInputValue("notes") || "none"
  };

  const description =


`_ _   ⁺  ⌦　　𓈒  𖨂໑  ˖ _ _           ❛ ❒　🎹 𓂅　  order for <@${interaction.user.id}>
-# _ _   ${interaction.user.username}'s order
-# _ _   ticket system _ _　˙ 　　　　.　　　˚　　　　۫ _ _            ＋　❛　▦ 　❀　  buying: ${data.buying} _ _            ＋　❛　▦ 　❀　  theme: ${data.theme} _ _            ＋　❛　▦ 　❀　  style: ${data.style} _ _            ＋　❛　▦ 　❀　  mop: ${data.mop} _ _            ＋　❛　▦ 　❀　  notes: ${data.notes}`;


  const embed = new EmbedBuilder()
    .setColor("#1c1d23")
    .setDescription(description);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("edit_order").setLabel("edit").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("approve_order").setLabel("approve").setStyle(ButtonStyle.Secondary)
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });

  return interaction.reply({ content: "order submitted", ephemeral: true });
}

// ================= APPROVE =================
if (interaction.isButton() && interaction.customId === "approve_order") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({ content: "no permission", ephemeral: true });
  }

  const queue = await interaction.guild.channels.fetch(QUEUE_CHANNEL_ID);

  const approvedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor("#1c1d23")
    .setDescription(interaction.message.embeds[0].description + "\n\nstatus: approved");

  await queue.send({
    content: `new approved order from <@${interaction.user.id}>`,
    embeds: [approvedEmbed]
  });

  return interaction.update({
    content: "approved",
    components: []
  });
}

// ================= CLOSE =================
if (interaction.isButton() && interaction.customId === "close_ticket") {
  return interaction.reply({
    content: "are you sure?",
    ephemeral: true,
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("close_yes").setLabel("yes").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("close_no").setLabel("no").setStyle(ButtonStyle.Secondary)
      )
    ]
  });
}

if (interaction.customId === "close_yes") {
  return interaction.channel.delete().catch(() => {});
}

if (interaction.customId === "close_no") {
  return interaction.reply({ content: "cancelled", ephemeral: true });
}


}
};

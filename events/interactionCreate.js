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

const orders = new Map();

module.exports = {
name: "interactionCreate",

async execute(interaction, client) {


// ================= COMMANDS =================
if (interaction.isChatInputCommand()) {
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  return cmd.execute(interaction, client);
}

// ================= PANEL SELECT =================
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

  const embed = new EmbedBuilder()
    .setColor("#1c1d23")
    .setDescription("ticket opened — press submit order below");

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

// ================= OPEN MODAL =================
if (interaction.isButton() && interaction.customId === "submit_order") {

  const modal = new ModalBuilder()
    .setCustomId("order_modal")
    .setTitle("order form");

  const fields = [
    ["buying", "buying", TextInputStyle.Short],
    ["theme", "theme", TextInputStyle.Short],
    ["style", "style", TextInputStyle.Short],
    ["mop", "mop", TextInputStyle.Short],
    ["notes", "notes", TextInputStyle.Paragraph]
  ];

  modal.addComponents(
    ...fields.map(f =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(f[0])
          .setLabel(f[1])
          .setStyle(f[2])
          .setRequired(f[0] !== "notes")
      )
    )
  );

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

  orders.set(interaction.user.id, data);

  const embed = new EmbedBuilder()
    .setColor("#1c1d23")
    .addFields(
      { name: "buying", value: data.buying },
      { name: "theme", value: data.theme },
      { name: "style", value: data.style },
      { name: "mop", value: data.mop },
      { name: "notes", value: data.notes }
    )
    .setFooter({ text: `order by ${interaction.user.username}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("edit_order").setLabel("edit").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("approve_order").setLabel("approve").setStyle(ButtonStyle.Secondary)
  );

  await interaction.channel.send({
    content: `<@${interaction.user.id}> order submitted`,
    embeds: [embed],
    components: [row]
  });

  return interaction.reply({ content: "submitted", ephemeral: true });
}

// ================= EDIT ORDER =================
if (interaction.isButton() && interaction.customId === "edit_order") {

  const modal = new ModalBuilder()
    .setCustomId("order_modal")
    .setTitle("edit order");

  const data = orders.get(interaction.user.id);

  const fields = [
    ["buying", data?.buying || ""],
    ["theme", data?.theme || ""],
    ["style", data?.style || ""],
    ["mop", data?.mop || ""],
    ["notes", data?.notes || ""]
  ];

  modal.addComponents(
    ...fields.map(f =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(f[0])
          .setLabel(f[0])
          .setStyle(f[0] === "notes" ? TextInputStyle.Paragraph : TextInputStyle.Short)
          .setValue(f[1] || "")
          .setRequired(f[0] !== "notes")
      )
    )
  );

  return interaction.showModal(modal);
}

// ================= APPROVE =================
if (interaction.isButton() && interaction.customId === "approve_order") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({ content: "no permission", ephemeral: true });
  }

  const queue = await interaction.guild.channels.fetch(QUEUE_CHANNEL_ID);

  const embed = interaction.message.embeds[0];

  const approved = EmbedBuilder.from(embed)
    .setColor("#1c1d23")
    .addFields({ name: "status", value: "approved" });

  await queue.send({
    content: `approved order from <@${interaction.user.id}>`,
    embeds: [approved]
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

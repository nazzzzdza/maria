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

  const orderText = `
_ _   ⁺  ⌦　　𓈒  𖨂໑  ˖
_ _           ❛ ❒　🎹 𓂅　  order   for   <@${interaction.user.id}>

-# _ _   ${interaction.user.username}'s order, do \`.done\` now
-# _ _   ${interaction.channel}

_ _　˙ 　　　　.　　　˚　　　　۫  　 𓈒

_ _            ＋　❛　▩ 　❀　  __buying:__ ${data.buying}
_ _ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎  ◝ ✧𓂅    🎬    ,    **theme:** ${data.theme}

_ _            ＋　❛　▩ 　❀　  __style:__ ${data.style}
_ _ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎  ◝ ✧𓂅    🎤    ,    **mop:** ${data.mop}

_ _            ＋　❛　▩ 　❀　  __notes:__
${data.notes}

_ _　˙ 　　　　.　　　˚　　　　۫  　 𓈒

status: pending approval
`;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("edit_order").setLabel("edit").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("approve_order").setLabel("approve").setStyle(ButtonStyle.Secondary)
  );

  await interaction.channel.send({
    content: orderText,
    components: [row]
  });

  return interaction.reply({
    content: "submitted",
    ephemeral: true
  });
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

// ================= APPROVE  ORDER =================
  
if (interaction.isButton() && interaction.customId === "approve_order") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({
      content: "no permission",
      ephemeral: true
    });
  }

  const queue = await interaction.guild.channels.fetch(QUEUE_CHANNEL_ID);

  const approvedText = interaction.message.content.replace(
    "status: pending approval",
    "status: approved"
  );

  await interaction.message.edit({
    content: approvedText,
    components: []
  });

  await queue.send({
    content: approvedText
  });

  return interaction.reply({
    content: "approved",
    ephemeral: true
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

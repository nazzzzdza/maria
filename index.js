const express = require("express");
const {
Client,
GatewayIntentBits,
Partials,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField
} = require("discord.js");

const { createClient } = require("@supabase/supabase-js");

const app = express();
app.get("/", (_, res) => res.send("Bot online"));
app.listen(3000, () => console.log("Web server running"));

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;

const PANEL_CHANNEL_ID = "1407109105079943289";
const CATEGORY_ID = "1387525349797269666";

const STAFF_ROLE_ID = "1500489431918837861";
const BOT_ROLE_ID = "1439161768223182859";

const QUEUE_CHANNEL_ID = "1507132141316603955";

// ================= SUPABASE =================
const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

// ================= CLIENT =================
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.DirectMessages,
GatewayIntentBits.MessageContent
],
partials: [Partials.Channel]
});

// ================= READY =================
client.once("ready", async () => {
console.log(`Logged in as ${client.user.tag}`);

// ⭐ CUSTOM STREAMING STATUS (YOUR TEXT HERE)
client.user.setPresence({
activities: [
{
name: "your orders & tickets",
type: 1, // STREAMING
url: "https://twitch.tv/discord"
}
],
status: "online"
});
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {

// ================= PANEL COMMAND =================
if (interaction.isChatInputCommand() && interaction.commandName === "panel") {

```
const row = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("ticket_select")
    .setPlaceholder("open a ticket")
    .addOptions([
      { label: "Buying", value: "buying" },
      { label: "Linking", value: "linking" }
    ])
);

return interaction.reply({
  content: "ticket panel",
  components: [row]
});
```

}

// ================= TICKET CREATE =================
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

```
const type = interaction.values[0];
const user = interaction.user;

const existing = await supabase
  .from("tickets")
  .select("*")
  .eq("user_id", user.id)
  .eq("open", true);

if (existing.data && existing.data.length > 0) {
  return interaction.reply({
    content: "you already have a ticket open",
    ephemeral: true
  });
}

const channelName = (type + "-" + user.username).toLowerCase();

const channel = await interaction.guild.channels.create({
  name: channelName,
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
        PermissionsBitField.Flags.SendMessages
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

await supabase.from("tickets").insert({
  user_id: user.id,
  channel_id: channel.id,
  type,
  open: true
});

const closeBtn = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("Close")
    .setStyle(ButtonStyle.Secondary)
);

await channel.send({
  content: "please type `.text` to start your order",
  components: [closeBtn]
});

return interaction.reply({
  content: "ticket created",
  ephemeral: true
});
```

}

// ================= CLOSE TICKET =================
if (interaction.isButton() && interaction.customId === "close_ticket") {

```
const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("confirm_close_yes")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  new ButtonBuilder()
    .setCustomId("confirm_close_no")
    .setLabel("No")
    .setStyle(ButtonStyle.Secondary)
);

return interaction.reply({
  content: "Are you sure you want to close this ticket?",
  components: [row],
  ephemeral: true
});
```

}

// ================= CONFIRM CLOSE =================
if (interaction.isButton() && interaction.customId === "confirm_close_yes") {

```
await supabase
  .from("tickets")
  .update({ open: false })
  .eq("channel_id", interaction.channel.id);

await interaction.channel.delete().catch(() => {});
```

}

if (interaction.isButton() && interaction.customId === "confirm_close_no") {
return interaction.reply({
content: "cancelled",
ephemeral: true
});
}

// ================= QUEUE BUTTONS =================
if (interaction.isButton()) {

```
if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) return;

let status = null;

if (interaction.customId === "queue_noted") status = "noted";
if (interaction.customId === "queue_processing") status = "processing";
if (interaction.customId === "queue_completed") status = "completed";

if (!status) return;

await supabase
  .from("queues")
  .update({ status })
  .eq("message_id", interaction.message.id);

await interaction.deferUpdate();

if (status === "completed") {

  const row = await supabase
    .from("queues")
    .select("*")
    .eq("message_id", interaction.message.id)
    .single();

  const data = row.data;

  const channel = await client.channels.fetch(data.ticket_channel_id);
  const user = await client.users.fetch(data.user_id);

  channel.send(`your order has been completed ${user}`);
}
```

}
});

client.login(TOKEN);

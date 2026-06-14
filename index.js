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
PermissionsBitField,
REST,
Routes,
SlashCommandBuilder
} = require("discord.js");

const { createClient } = require("@supabase/supabase-js");

// ================= EXPRESS =================
const app = express();
app.get("/", (_, res) => res.send("Bot online"));
app.listen(3000, () => console.log("Web server running"));

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

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

// ================= SLASH COMMANDS =================
const commands = [
new SlashCommandBuilder()
.setName("panel")
.setDescription("Open ticket panel"),

new SlashCommandBuilder()
.setName("queue")
.setDescription("Create queue entry")
.addUserOption(o =>
o.setName("user").setDescription("User").setRequired(true)
)
.addChannelOption(o =>
o.setName("ticket").setDescription("Ticket channel").setRequired(true)
)
.addStringOption(o =>
o.setName("buying").setDescription("Buying").setRequired(true)
)
.addStringOption(o =>
o.setName("theme").setDescription("Theme").setRequired(true)
)
.addStringOption(o =>
o.setName("style").setDescription("Style").setRequired(true)
)
.addStringOption(o =>
o.setName("mop").setDescription("MOP").setRequired(true)
)
.addStringOption(o =>
o.setName("notes").setDescription("Notes").setRequired(true)
)
].map(cmd => cmd.toJSON());

// ================= READY =================
client.once("ready", async () => {
console.log(`Logged in as ${client.user.tag}`);

// STREAMING STATUS
client.user.setPresence({
activities: [
{
name: "handling commissions",
type: 1,
url: "https://twitch.tv/discord"
}
],
status: "online"
});

// AUTO REGISTER COMMANDS
try {
const rest = new REST({ version: "10" }).setToken(TOKEN);

```
await rest.put(
  Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
  { body: commands }
);

console.log("Slash commands registered");
```

} catch (err) {
console.log("Command register error:", err);
}
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {

// PANEL COMMAND
if (interaction.isChatInputCommand() && interaction.commandName === "panel") {

```
const row = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("ticket_select")
    .setPlaceholder("Open a ticket")
    .addOptions([
      { label: "Buying", value: "buying" },
      { label: "Linking", value: "linking" }
    ])
);

return interaction.reply({
  content: "Ticket panel",
  components: [row]
});
```

}

// CREATE TICKET
if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

```
const type = interaction.values[0];
const user = interaction.user;

const existing = await supabase
  .from("tickets")
  .select("*")
  .eq("user_id", user.id)
  .eq("open", true);

if (existing.data?.length > 0) {
  return interaction.reply({
    content: "You already have a ticket open",
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
  content: "Ticket created",
  ephemeral: true
});
```

}

// CLOSE BUTTON
if (interaction.isButton() && interaction.customId === "close_ticket") {

```
const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("close_yes")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  new ButtonBuilder()
    .setCustomId("close_no")
    .setLabel("No")
    .setStyle(ButtonStyle.Secondary)
);

return interaction.reply({
  content: "Are you sure?",
  components: [row],
  ephemeral: true
});
```

}

if (interaction.customId === "close_yes") {

```
await supabase
  .from("tickets")
  .update({ open: false })
  .eq("channel_id", interaction.channel.id);

await interaction.channel.delete().catch(() => {});
```

}

if (interaction.customId === "close_no") {
return interaction.reply({
content: "Cancelled",
ephemeral: true
});
}

// QUEUE COMMAND
if (interaction.isChatInputCommand() && interaction.commandName === "queue") {

```
const user = interaction.options.getUser("user");
const ticket = interaction.options.getChannel("ticket");

const buying = interaction.options.getString("buying");
const theme = interaction.options.getString("theme");
const style = interaction.options.getString("style");
const mop = interaction.options.getString("mop");
const notes = interaction.options.getString("notes");

const queueChannel = await interaction.guild.channels.fetch(QUEUE_CHANNEL_ID);

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("queue_noted").setLabel("Noted").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("queue_processing").setLabel("Processing").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("queue_completed").setLabel("Completed").setStyle(ButtonStyle.Success)
);

const msg =
```

`order for ${user}
ticket: ${ticket}
buying: ${buying}
theme: ${theme}
style: ${style}
mop: ${mop}
notes: ${notes}`;

```
const sent = await queueChannel.send({
  content: msg,
  components: [row]
});

await supabase.from("queues").insert({
  user_id: user.id,
  ticket_channel_id: ticket.id,
  message_id: sent.id,
  open: true
});

return interaction.reply({
  content: "Queue created",
  ephemeral: true
});
```

}

// QUEUE BUTTONS
if (interaction.isButton()) {

```
if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) return;

let status = null;

if (interaction.customId === "queue_noted") status = "noted";
if (interaction.customId === "queue_processing") status = "processing";
if (interaction.customId === "queue_completed") status = "completed";

if (!status) return;

await interaction.deferUpdate();

await supabase
  .from("queues")
  .update({ status })
  .eq("message_id", interaction.message.id);

if (status === "completed") {

  const row = await supabase
    .from("queues")
    .select("*")
    .eq("message_id", interaction.message.id)
    .single();

  const data = row.data;

  const channel = await client.channels.fetch(data.ticket_channel_id);
  const user = await client.users.fetch(data.user_id);

  channel.send("your order has been completed " + user);
}
```

}
});

client.login(TOKEN);

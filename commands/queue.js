const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
.setName("queue")
.setDescription("Create queue entry")
.addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
.addChannelOption(o => o.setName("ticket").setDescription("Ticket channel").setRequired(true))
.addStringOption(o => o.setName("buying").setDescription("Buying").setRequired(true))
.addStringOption(o => o.setName("theme").setDescription("Theme").setRequired(true))
.addStringOption(o => o.setName("style").setDescription("Style").setRequired(true))
.addStringOption(o => o.setName("mop").setDescription("MOP").setRequired(true))
.addStringOption(o => o.setName("notes").setDescription("Notes").setRequired(true)),

async execute(interaction) {

```
const user = interaction.options.getUser("user");
const ticket = interaction.options.getChannel("ticket");

const buying = interaction.options.getString("buying");
const theme = interaction.options.getString("theme");
const style = interaction.options.getString("style");
const mop = interaction.options.getString("mop");
const notes = interaction.options.getString("notes");

const channel = await interaction.guild.channels.fetch("1507132141316603955");

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
await channel.send({
  content: msg,
  components: [row]
});

await interaction.reply({ content: "queue created", ephemeral: true });
```

}
};

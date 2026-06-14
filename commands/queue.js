const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

const QUEUE_CHANNEL_ID = "1507132141316603955";

async function createQueue(interaction) {

const user = interaction.options.getUser("user");
const ticket = interaction.options.getChannel("ticket");

const buying = interaction.options.getString("buying");
const theme = interaction.options.getString("theme");
const style = interaction.options.getString("style");
const mop = interaction.options.getString("mop");
const notes = interaction.options.getString("notes");

const queueChannel =
await interaction.guild.channels.fetch(
QUEUE_CHANNEL_ID
);

const buttons = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("queue_noted")
.setLabel("Noted")
.setStyle(ButtonStyle.Secondary),

```
  new ButtonBuilder()
    .setCustomId("queue_processing")
    .setLabel("Processing")
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId("queue_completed")
    .setLabel("Completed")
    .setStyle(ButtonStyle.Secondary)
);
```

const content =
`_ _   ⁺  ⌦　　𓈒  𖨂໑  ˖ _ _           ❛ ❒　\`🎹` 𓂅　  order   for   ${user}
-# _ _   ${user}'s   order,   do `.done` now
-# _ _     ${ticket}
_ _　˙ 　　　　.　　　˚　　　　۫  　 𓈒
_ _            ＋　❛　▩ 　❀　  **buying:** ${buying}
_ _ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎  ◝ ✧𓂅    `🎬`    ,    **theme:** ${theme}
_ _            ＋　❛　▩ 　❀　  **style:** ${style}
_ _ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎  ◝ ✧𓂅    `🎤`    ,    **mop:** ${mop}
_ _            ＋　❛　▩ 　❀　  **notes:**
${notes}
_ _　˙ 　　　　.　　　˚　　　　۫  　 𓈒`;

const msg = await queueChannel.send({
content,
components: [buttons]
});

await supabase
.from("queues")
.insert({
user_id: user.id,
ticket_channel_id: ticket.id,
buying,
theme,
style,
mop,
notes,
status: "noted",
message_id: msg.id
});

await interaction.reply({
content: "queue entry created.",
ephemeral: true
});
}

module.exports = {
createQueue
};

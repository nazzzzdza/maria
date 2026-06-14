const {
SlashCommandBuilder,
ActionRowBuilder,
StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
.setName("panel")
.setDescription("Open ticket panel"),

async execute(interaction) {

const row = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("ticket_select")
    .setPlaceholder("Open a ticket")
    .addOptions(
      {
        label: "Buying",
        value: "buying"
      },
      {
        label: "Linking",
        value: "linking"
      }
    )
);

return interaction.reply({
  content:

`.　  ✦　  ˚  　⊹  　˖　  ❜
      (˶•ᴗ•)⌒)ↄ   ❥୧    our   tickets _ _      ˚❒ ⠀ ⤷☒⠀⠀𖥨🍓    open  4  buying  or  linking
.　  ✦　  ˚  　⊹  　˖　  ❜`,
components: [row]
});
}
};

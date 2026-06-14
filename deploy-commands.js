const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
new SlashCommandBuilder()
.setName("panel")
.setDescription("Send the ticket panel"),

new SlashCommandBuilder()
.setName("queue")
.setDescription("Create a queue entry")
.addUserOption(option =>
option
.setName("user")
.setDescription("Customer")
.setRequired(true)
)
.addChannelOption(option =>
option
.setName("ticket")
.setDescription("Ticket channel")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("buying")
.setDescription("What they bought")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("theme")
.setDescription("Theme")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("style")
.setDescription("Style")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("mop")
.setDescription("Method of payment")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("notes")
.setDescription("Notes")
.setRequired(true)
)
].map(command => command.toJSON());

const rest = new REST({
version: "10"
}).setToken(process.env.TOKEN);

(async () => {
try {
console.log("Registering commands...");

```
await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  {
    body: commands
  }
);

console.log("Commands registered.");
```

} catch (error) {
console.error(error);
}
})();

const express = require("express");
const fs = require("fs");
const path = require("path");
const {
Client,
GatewayIntentBits,
Partials,
REST,
Routes
} = require("discord.js");

const app = express();
app.get("/", (_, res) => res.send("Bot online"));
app.listen(3000, () => console.log("Web server running"));

const client = new Client({
intents: [GatewayIntentBits.Guilds],
partials: [Partials.Channel]
});

client.commands = new Map();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
const cmd = require(`./commands/${file}`);
client.commands.set(cmd.data.name, cmd);
commands.push(cmd.data.toJSON());
}

// Load events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
const event = require(`./events/${file}`);
if (event.once) {
client.once(event.name, (...args) => event.execute(...args, client));
} else {
client.on(event.name, (...args) => event.execute(...args, client));
}
}

// AUTO DEPLOY SLASH COMMANDS (THIS FIXES YOUR ISSUE)
client.once("ready", async () => {
console.log(`Logged in as ${client.user.tag}`);

client.user.setPresence({
activities: [{ name: "handling commissions", type: 1 }],
status: "online"
});

try {
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

```
console.log("Deploying slash commands...");

await rest.put(
  Routes.applicationGuildCommands(
    process.env.CLIENT_ID,
    process.env.GUILD_ID
  ),
  { body: commands }
);

console.log("Slash commands deployed");
```

} catch (err) {
console.log("Command deploy error:", err);
}
});

client.login(process.env.TOKEN);

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
app.listen(process.env.PORT || 3000, () =>
  console.log("Web server running")
);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

client.commands = new Map();
const commands = [];

try {
  const cmdPath = path.join(__dirname, "commands");

  if (fs.existsSync(cmdPath)) {
    for (const file of fs.readdirSync(cmdPath).filter(f => f.endsWith(".js"))) {
      const cmd = require(`./commands/${file}`);
      client.commands.set(cmd.data.name, cmd);
      commands.push(cmd.data.toJSON());
    }
  } else {
    console.log("No commands folder found");
  }

} catch (err) {
  console.error("Command load error:", err);
}

try {
  const eventPath = path.join(__dirname, "events");

  if (fs.existsSync(eventPath)) {
    for (const file of fs.readdirSync(eventPath).filter(f => f.endsWith(".js"))) {
      const event = require(`./events/${file}`);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  }
} catch (err) {
  console.error("Event load error:", err);
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "tickets & queue", type: 3 }],
    status: "online"
  });

  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    console.log("Deploying slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands deployed");
  } catch (err) {
    console.error("Deploy error:", err);
  }
});

client.login(process.env.TOKEN);

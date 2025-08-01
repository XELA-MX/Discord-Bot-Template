import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import { readdir } from "fs/promises";
import { Client, GatewayIntentBits } from "discord.js";
import { deployCommands } from "./deployer.js"; // O usa { deployCommands } según tu export
import chalk from "chalk";

const allIntents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
];

const commandCollection = {};
const buttonHandlers = {};

// Carga dinámica de comandos
const files = await readdir("./Commands");
for (const file of files) {
  if (file.endsWith(".js")) {
    const commandName = file.replace(".js", "");
    const commandHandler = (await import(`./Commands/${file}`)).default;
    commandCollection[commandName] = commandHandler;
  }
}

// Carga dinámica de handlers de botones
const buttonFiles = await readdir("./ButtonHandlers");
for (const file of buttonFiles) {
  if (file.endsWith(".js")) {
    const buttonId = file.replace(".js", "");
    const handler = (await import(`./ButtonHandlers/${file}`)).default;
    buttonHandlers[buttonId] = handler;
  }
}

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("No token provided. Please set the TOKEN in config.env.");
  process.exit(1);
}

console.log(chalk.blue("Starting the Discord bot..."));

const client = new Client({
  intents: allIntents,
});

client.once("ready", () => {
  console.log(chalk.green(`Logged in as ${client.user.tag}!`));
  deployCommands().catch((error) => {
    console.error("Failed to deploy commands:", error);
  });
  console.log(chalk.blue("Commands deployed successfully."));
});

client.on("interactionCreate", async (interaction) => {
  // Primero: Botones
  if (interaction.isButton()) {
    const handler = buttonHandlers[interaction.customId];
    if (handler) {
      try {
        await handler(interaction);
      } catch (err) {
        console.error("Error in button handler:", err);
        if (!interaction.replied)
          await interaction.reply({
            content: "Error executing button.",
            flags: 1 << 6,
          });
      }
    } else {
      if (!interaction.replied)
        await interaction.reply({
          content: "This button does not have a handler.",
          flags: 1 << 6,
        });
    }
    return; // No sigas, esto ya es botón
  } // Segundo: Slash Commands

  if (interaction.isChatInputCommand()) {
    const handler = commandCollection[interaction.commandName];
    if (!handler) {
      console.error(`No handler found for command: ${interaction.commandName}`);
      return interaction.reply({
        content: "An error occurred while processing your command.",
        flags: 1 << 6,
      });
    }
    try {
      await handler(interaction);
    } catch (err) {
      console.error(`Error in handler for /${interaction.commandName}:`, err);
      if (!interaction.replied)
        await interaction.reply({
          content: "There was an error executing this command.",
          flags: 1 << 6,
        });
    }
  } // ...puedes agregar aquí más tipos de interacción ("modal", "select", etc) si los usas...
});

client.login(TOKEN).catch((error) => {
  console.error("Failed to login:", error);
});

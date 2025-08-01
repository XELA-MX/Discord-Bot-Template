import { REST, Routes } from "discord.js";
import { readdir } from "fs/promises";
const commands = [];

// Carga dinámica de comandos
const files = await readdir("./Commands");
for (const file of files) {
  if (file.endsWith(".js")) {
    const commandData = (await import(`./Commands/${file}`)).data.toJSON();
    commands.push(commandData);
  }
}

export const deployCommands = async () => {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error("Failed to register application commands:", error);
  }
};

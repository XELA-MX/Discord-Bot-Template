import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Answer with Pong!");

export default async function ping(interaction) {
  await interaction.reply("Pong!");
}

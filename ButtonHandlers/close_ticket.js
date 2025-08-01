import { Message, MessageFlags, ChannelType } from "discord.js";

export default async function (interaction) {
  // Close the ticket channel
  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.reply({
      content: "This command can only be used in a text channel.",
      flags: MessageFlags.Ephemeral,
    });
  }
  // Check if the channel is a ticket channel
  if (!channel.name.endsWith("-ticket")) {
    return interaction.reply({
      content: "This command can only be used in a ticket channel.",
      flags: MessageFlags.Ephemeral,
    });
  }
  // Send a confirmation message
  await interaction.reply({
    content: "Closing the ticket...",
  });
  // Delete the channel after a short delay
  setTimeout(async () => {
    try {
      await channel.delete();
      // Notify the user that the ticket has been closed via dm
      const user = await interaction.user.send({
        content: `Your ticket in ${interaction.guild.name} has been closed.`,
      });
      if (!user) {
        console.error("Failed to send DM to user.");
        return;
      }
    } catch (error) {
      console.error("Error closing ticket channel:", error);
      await interaction.followUp({
        content: "There was an error closing the ticket channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }, 5000); // Adjust the delay as needed
}

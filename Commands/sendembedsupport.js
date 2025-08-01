import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("sendembedsupport")
  .setDescription("Send an embed message")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("Title of the embed")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("Description of the embed")
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Channel to send the embed to")
      .setRequired(true)
  );

export default async function sendEmbed(interaction) {
  // Check permissions
  if (!interaction.member.permissions.has("ManageMessages")) {
    return interaction.reply({
      content: "You do not have permission to use this command.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const title = interaction.options.getString("title");
  const description = interaction.options.getString("description");
  const channel = interaction.options.getChannel("channel");
  const embed = {
    color: 0x0099ff,
    title: title,
    description: description,
    timestamp: new Date(),
    footer: {
      text: "We will be happy to assist you",
    },
  };

  // Button to open a support ticket
  const button = new ButtonBuilder()
    .setCustomId("support_ticket")
    .setLabel("Open Support Ticket")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({
    content: `Embed sent to ${channel}`,
    flags: MessageFlags.Ephemeral,
  });
}

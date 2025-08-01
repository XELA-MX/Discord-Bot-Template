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
  .setName("nuke")
  .setDescription("Nuke a channel")
  .addChannelOption((option) =>
    option.setName("channel").setDescription("Channel to nuke")
  );

export default async function nukeChannel(interaction) {
  // Check for permissions
  if (!interaction.member.permissions.has("ManageChannels")) {
    return await interaction.reply({
      content: "You do not have permission to nuke channels.",
      ephemeral: true,
    });
  }
  let channel = interaction.options.getChannel("channel");
  if (!channel || channel.type !== ChannelType.GuildText) {
    channel = interaction.channel;
  }
  // Delete the channel and create a new one with the same name
  const channelName = channel.name;
  await channel.delete();
  const newChannel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
  });
  // Assign new channel to categories and permissions
  const parent = channel.parent;
  if (parent) {
    await newChannel.setParent(parent.id);
  }
  const permissions = channel.permissionOverwrites.cache;
  for (const [id, permission] of permissions) {
    await newChannel.permissionOverwrites.create(id, permission);
  }

  await newChannel.send("This channel has been nuked!");
}

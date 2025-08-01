import { ChannelType, PermissionsBitField } from "discord.js";

export default async function (interaction) {
  // Obtén el nombre del canal
  const channelName = `${interaction.user.username}-ticket`;

  // Verifica si el canal ya existe
  const existingChannel = interaction.guild.channels.cache.find(
    (channel) =>
      channel.name === channelName && channel.type === ChannelType.GuildText
  );
  if (existingChannel) {
    return interaction.reply({
      content: `You already have an open ticket: <#${existingChannel.id}>`,
      flags: 1 << 6, // Ephemeral
    });
  }

  // Crea el canal en el servidor
  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id, // Rol everyone
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      // Añade aquí IDs para el staff si quieres que vean los tickets
    ],
  });

  // Welcome message embed mentioning user and close button
  const embed = {
    color: 0x0099ff,
    title: "Support Ticket",
    description:
      "Welcome to your support ticket! How can we assist you?" +
      ` <@${interaction.user.id}>`,
    timestamp: new Date(),
    footer: {
      text: "Click the button below to close this ticket.",
    },
  };

  const closeButton = {
    type: 2, // Button type
    style: 4, // Danger style
    label: "Close Ticket",
    custom_id: "close_ticket", // Custom ID for the button
  };

  const row = {
    type: 1, // Action row type
    components: [closeButton], // Add the close button to the row
  };

  await channel.send({
    embeds: [embed],
    components: [row],
  });

  // Mention the user in the channel
  let userMention = await channel.send(`<@${interaction.user.id}>`);
  setTimeout(() => {
    userMention.delete().catch(console.error);
  }, 1000); // Deletes the mention after 1 second

  await interaction.reply({
    content: `Ticket Created:  <#${channel.id}>`,
    flags: 1 << 6,
  });
}

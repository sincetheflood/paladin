const { Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { channels } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bans the target. Requires the BAN_MEMBERS permisson")
		.addUserOption((option) => option.setName("target").setDescription("Target of the ban").setRequired(true))
		.addStringOption((option) => option.setName("reason").setDescription("Reason for the ban")),
	async execute(interaction) {
		// Make sure the user trying to ban someone is able to do so
		const author = await interaction.guild.members.fetch(interaction.user.id);
		if (author.permissions.has(Permissions.FLAGS.BAN_MEMBERS) === false) {
			return interaction.reply("You need the `BAN_MEMBERS` permission to do that.");
		}
		// Make sure the bot is able to ban users
		const bot = await interaction.guild.members.fetch(interaction.client.user.id);
		if (bot.permissions.has(Permissions.FLAGS.BAN_MEMBERS) === false) {
			return interaction.reply("I need the `BAN_MEMBERS` permission to do that.");
		}

		// Get the command options
		const target = interaction.options.getUser("target");
		const reason = interaction.options.getString("reason");

		// Make sure the target isn't already banned before banning them
		const banList = await interaction.guild.bans.fetch();
		if ((await banList.has(target.id)) === true) {
			return interaction.reply("That user is already banned!");
		}

		interaction.guild.members
			.ban(target, {
				reason: reason ?? `Contact ${author.user.username}#${author.user.discriminator} (${author.user.id}) for details.`,
			})
			.then(() => {
				const logChannel = interaction.client.channels.cache.get(channels.log.public);
				logChannel.send({
					embeds: [
						{
							color: 0xed1515,
							author: {
								name: `${author.user.username}#${author.user.discriminator} (${author.user.id})`,
								icon_url: author.user.displayAvatarURL(),
							},
							description: [
								`**User**: \`${target.username}#${target.discriminator}\` (<@${target.id}>)`,
								`**Action**: Ban`,
								`**Reason**: ${reason ?? `Contact <@${user.id}> for details.`}`,
							].join("\n"),
							timestamp: new Date(),
						},
					],
				});
			})
			.then(() => interaction.reply(`User successfully banned!`))
			.catch((error) => {
				console.error(error);
				interaction.reply(`Something went wrong: \`${error}\``);
			});
	},
};
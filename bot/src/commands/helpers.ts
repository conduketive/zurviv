import {
    ApplicationCommandOptionType,
    type ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";
import type z from "zod";
import { botLogger, Command, honoClient, isAdmin } from "../utils";

export function createCommand<T extends z.ZodSchema>(config: {
    name: Command;
    description: string;
    optionValidator: T;
    isPrivateRoute?: boolean;
    options: {
        name: keyof z.input<T>;
        description: string;
        required: boolean;
        type:
            | ApplicationCommandOptionType.String
            | ApplicationCommandOptionType.Integer
            | ApplicationCommandOptionType.Boolean
            | ApplicationCommandOptionType.User;
    }[];
}) {
    return config;
}

export async function genericExecute<N extends Exclude<Command, "search_player">>(
    name: N,
    interaction: ChatInputCommandInteraction,
    validator: z.ZodTypeAny,
    isPrivateRoute = false,
) {
    await interaction.deferReply({ ephemeral: name === Command.CreatePrivateGames });

    const options = interaction.options.data.reduce(
        (obj, { name, value }) => {
            obj[name] = value;
            return obj;
        },
        {} as Record<string, unknown>,
    );

    const args = validator.safeParse({
        ...options,
        executor_id: interaction.user.id,
    });

    if (!args.success) {
        await interaction.followUp({
            content: "Invalid arguments",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (isPrivateRoute && !isAdmin(interaction)) {
        await sendNoPermissionMessage(interaction);
        return;
    }

    try {
        // @ts-expect-error - we don't need validation at this point, params are validated beforehand
        const client = isPrivateRoute ? honoClient[name] : honoClient.moderation[name];
        const res = await client.$post({
            json: args.data as any,
        });

        const data = await res.json();

        // extra guard in case;
        if (!data || !data.message) {
            await interaction.followUp({
                content: "no response message",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const { message } = data;
        await interaction.editReply(message);
    } catch (err) {
        botLogger.error("Failed to send request to API:", err);
        await interaction.editReply({ content: "API error" });
    }
}

export function createSlashCommand(config: ReturnType<typeof createCommand>) {
    const builder = new SlashCommandBuilder()
        .setName(config.name)
        .setDescription(config.description);

    const configureBuilderOption = (opt: any, option: any) =>
        opt
            .setName(option.name as string)
            .setDescription(option.description)
            .setRequired(option.required);

    for (const option of config.options) {
        switch (option.type) {
            case ApplicationCommandOptionType.String:
                builder.addStringOption((opt) => configureBuilderOption(opt, option));
                break;
            case ApplicationCommandOptionType.Integer:
                builder.addIntegerOption((opt) => configureBuilderOption(opt, option));
                break;
            case ApplicationCommandOptionType.Boolean:
                builder.addBooleanOption((opt) => configureBuilderOption(opt, option));
                break;
            case ApplicationCommandOptionType.User:
                builder.addUserOption((opt) => configureBuilderOption(opt, option));
                break;
            default:
                throw new Error(`Unsupported option type: ${option.type}, add it first.`);
        }
    }

    return builder;
}

export async function sendNoPermissionMessage(interaction: ChatInputCommandInteraction) {
    if (!interaction.isRepliable()) return;
    const errorMessage = {
        content: "You do not have permission to use this action.",
        flags: MessageFlags.Ephemeral,
    } as const;
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
    } else {
        await interaction.reply(errorMessage);
    }
}

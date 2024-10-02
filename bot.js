const { Client, Intents, ActivityType, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { DateTime } = require('luxon'); 
const process = require('process');

// ----- Configuration -----
const settings = {
    token: '', 
    prefix: '.', 
    bot_status: '@FlexXero on Github', 
};

// ----- Logging -----
function log(text, sleepTime = null) {
    const timestamp = DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss');
    console.log(`[${timestamp}] → ${text}`);
    if (sleepTime) {
        //you can use asynchronous delays if needed.
        return new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
    }
}

// ----- Discord Client -----
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', async () => {
    log(`Connected to ${client.user.tag}`);
    client.user.setPresence({
        activities: [{
            name: settings.bot_status,
            type: ActivityType.Watching,
        }],
        status: 'online',
    });
});

// ----- Helper Functio -----
async function validateCookie(cookie) {
    try {
        const response = await axios.get('https://users.roblox.com/v1/users/authenticated', {
            headers: {
                Cookie: `.ROBLOSECURITY=${cookie}`,
            },
        });
        if (response.data && response.data.id) {
            return { valid: true, data: response.data };
        }
        return { valid: false, error: 'Unauthorized' };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { valid: false, error: 'Unauthorized' };
        }
        return { valid: false, error: error.message };
    }
}

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(settings.prefix) || message.author.bot) return;

    const args = message.content.slice(settings.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'vc') {
        const cookie = args[0];
        if (!cookie) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Missing Cookie')
                .setColor(0xFF0000);
            await message.channel.send({ embeds: [embed] });
            log(`User ${message.author.tag} tried to use ${settings.prefix}vc but did not provide a cookie.`);
            return;
        }

        try {
            await message.delete();
        } catch (err) {
            console.error('Failed to delete message:', err);
        }

        const validation = await validateCookie(cookie);
        if (validation.valid) {
            log(`User ${message.author.tag} used ${settings.prefix}vc with a valid cookie.`);
            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: Valid Cookie')
                .setColor(0x38d13b)
                .addFields({ name: 'Passed Cookie:', value: '```Hidden```', inline: false })
                .setFooter({ text: 'Check your DMs for the cookie.' });

            try {
                await message.author.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(':white_check_mark: Cookie')
                            .setDescription(`\`\`\`${cookie}\`\`\``)
                            .setColor(0x38d13b),
                    ],
                });
            } catch (err) {
                console.error(`Could not send DM to ${message.author.tag}:`, err);
            }

            await message.channel.send({ embeds: [embed] });
        } else if (validation.error === 'Unauthorized') {
            log(`User ${message.author.tag} used ${settings.prefix}vc with an invalid cookie.`);
            const embed = new EmbedBuilder()
                .setTitle(':x: Invalid Cookie')
                .setColor(0xFF0000)
                .addFields({ name: 'Passed Cookie:', value: '```Hidden```', inline: false });
            await message.channel.send({ embeds: [embed] });
        } else {
            log(`User ${message.author.tag} used ${settings.prefix}vc but Roblox returned a bad response.`);
            const embed = new EmbedBuilder()
                .setTitle(':x: Error')
                .setColor(0xFFFF00)
                .addFields({ name: 'Error:', value: `\`\`\`${validation.error}\`\`\``, inline: false });
            await message.channel.send({ embeds: [embed] });
        }
    }

    else if (command === 'vcr') {
        const cookie = args[0];
        if (!cookie) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Missing Cookie')
                .setColor(0xFF0000);
            await message.channel.send({ embeds: [embed] });
            log(`User ${message.author.tag} tried to use ${settings.prefix}vcr but did not provide a cookie.`);
            return;
        }

        try {
            await message.delete();
        } catch (err) {
            console.error('Failed to delete message:', err);
        }

        const validation = await validateCookie(cookie);
        if (validation.valid) {
            log(`User ${message.author.tag} used ${settings.prefix}vcr with a valid cookie.`);
            const userId = validation.data.id;

            let robux = 0;
            try {
                const robuxResponse = await axios.get(`https://economy.roblox.com/v1/users/${userId}/currency`, {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                robux = robuxResponse.data.robux;
            } catch (err) {
                console.error('Error fetching Robux:', err);
            }

            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: Valid Cookie')
                .setColor(0x38d13b)
                .addFields(
                    { name: 'Passed Cookie:', value: '```Hidden```', inline: false },
                    { name: ':money_mouth: Robux', value: robux.toString(), inline: true }
                );

            try {
                await message.author.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(':white_check_mark: Cookie')
                            .setDescription(`\`\`\`${cookie}\`\`\``)
                            .setColor(0x38d13b),
                    ],
                });
            } catch (err) {
                console.error(`Could not send DM to ${message.author.tag}:`, err);
            }

            await message.channel.send({ embeds: [embed] });
        } else if (validation.error === 'Unauthorized') {
            log(`User ${message.author.tag} used ${settings.prefix}vcr with an invalid cookie.`);
            const embed = new EmbedBuilder()
                .setTitle(':x: Invalid Cookie')
                .setColor(0xFF0000)
                .addFields({ name: 'Passed Cookie:', value: '```Hidden```', inline: false });
            await message.channel.send({ embeds: [embed] });
        } else {
            log(`User ${message.author.tag} used ${settings.prefix}vcr but Roblox returned a bad response.`);
            const embed = new EmbedBuilder()
                .setTitle(':x: Error')
                .setColor(0xFFFF00)
                .addFields({ name: 'Error:', value: `\`\`\`${validation.error}\`\`\``, inline: false });
            await message.channel.send({ embeds: [embed] });
        }
    }

    else if (command === 'full') {
        const cookie = args[0];
        if (!cookie) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Missing Cookie')
                .setColor(0xFF0000);
            await message.channel.send({ embeds: [embed] });
            return;
        }

        try {
            await message.delete();
        } catch (err) {
            console.error('Failed to delete message:', err);
        }

        const validation = await validateCookie(cookie);
        const hidden = '```Hidden```';

        if (validation.valid) {
            const userId = validation.data.id;
            log(`User ${message.author.tag} used ${settings.prefix}full with a valid cookie.`);

            // variables
            let robux = 0;
            let balanceCredit = 0;
            let balanceCreditCurrency = '';
            let accountName = '';
            let accountDisplayName = '';
            let accountEmailVerified = '';
            let accountAbove13 = false;
            let accountAgeInYears = 0;
            let accountHasPremium = false;
            let accountHasPin = false;
            let accountTwoStep = false;
            let accountFriends = 0;
            let accountGamepasses = 0;
            let accountBadges = '';
            let accountSalesOfGoods = 0;
            let accountPurchasesTotal = 0;
            let accountCommissions = 0;
            let accountRobuxPurchased = 0;
            let accountPremiumPayoutsTotal = 0;
            let accountPendingRobux = 0;
            let accountVoiceVerified = false;
            let avatarUrl = '';

            try {
                const robuxResponse = await axios.get(`https://economy.roblox.com/v1/users/${userId}/currency`, {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                robux = robuxResponse.data.robux;
            } catch (err) {
                console.error('Error fetching Robux:', err);
            }

            try {
                const balanceResponse = await axios.get('https://billing.roblox.com/v1/credit', {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                balanceCredit = balanceResponse.data.balance;
                balanceCreditCurrency = balanceResponse.data.currencyCode;
            } catch (err) {
                console.error('Error fetching balance credit:', err);
            }

            try {
                const settingsResponse = await axios.get('https://www.roblox.com/my/settings/json', {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                accountName = settingsResponse.data.Name;
                accountDisplayName = settingsResponse.data.DisplayName;
                accountEmailVerified = settingsResponse.data.IsEmailVerified
                    ? `${settingsResponse.data.IsEmailVerified} (\`${settingsResponse.data.UserEmail}\`)`
                    : 'No';
                accountAbove13 = settingsResponse.data.UserAbove13;
                accountAgeInYears = Math.round(settingsResponse.data.AccountAgeInDays / 365 * 100) / 100;
                accountHasPremium = settingsResponse.data.IsPremium;
                accountHasPin = settingsResponse.data.IsAccountPinEnabled;
                accountTwoStep = settingsResponse.data.MyAccountSecurityModel.IsTwoStepEnabled;
            } catch (err) {
                console.error('Error fetching account settings:', err);
            }

            try {
                const friendsResponse = await axios.get('https://friends.roblox.com/v1/my/friends/count', {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                accountFriends = friendsResponse.data.count;
            } catch (err) {
                console.error('Error fetching friends count:', err);
            }

            try {
                const voiceResponse = await axios.get('https://voice.roblox.com/v1/settings', {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                accountVoiceVerified = voiceResponse.data.isVerifiedForVoice;
            } catch (err) {
                console.error('Error fetching voice verification:', err);
            }

            try {
                const gamepassesResponse = await axios.get(`https://www.roblox.com/users/inventory/list-json?assetTypeId=34&cursor=&itemsPerPage=100&pageNumber=1&userId=${userId}`, {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                const prices = gamepassesResponse.data.data.map(item => item.PriceInRobux).filter(price => price !== null);
                accountGamepasses = prices.reduce((a, b) => a + b, 0) + ' R$';
            } catch (err) {
                console.error('Error fetching gamepasses:', err);
            }

            try {
                const badgesResponse = await axios.get(`https://accountinformation.roblox.com/v1/users/${userId}/roblox-badges`, {
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                accountBadges = badgesResponse.data.data.map(badge => badge.name).join(', ');
            } catch (err) {
                console.error('Error fetching badges:', err);
            }

            try {
                const transactionsResponse = await axios.get(`https://economy.roblox.com/v2/users/${userId}/transaction-totals`, {
                    params: {
                        timeFrame: 'Year',
                        transactionType: 'summary',
                    },
                    headers: {
                        Cookie: `.ROBLOSECURITY=${cookie}`,
                    },
                });
                const transactions = transactionsResponse.data;
                accountSalesOfGoods = transactions.salesTotal;
                accountPurchasesTotal = Math.abs(parseInt(transactions.purchasesTotal));
                accountCommissions = transactions.affiliateSalesTotal;
                accountRobuxPurchased = transactions.currencyPurchasesTotal;
                accountPremiumPayoutsTotal = transactions.premiumPayoutsTotal;
                accountPendingRobux = transactions.pendingRobuxTotal;
            } catch (err) {
                console.error('Error fetching transactions:', err);
            }

            try {
                const avatarResponse = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot`, {
                    params: {
                        size: '48x48',
                        format: 'png',
                        userIds: userId,
                    },
                });
                avatarUrl = avatarResponse.data.data[0].imageUrl;
            } catch (err) {
                console.error('Error fetching avatar URL:', err);
            }

            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: Valid Cookie')
                .setColor(0x38d13b)
                .addFields(
                    { name: 'Passed Cookie:', value: hidden, inline: false },
                    { name: ':money_mouth: Robux', value: robux.toString(), inline: true },
                    { name: ':moneybag: Balance', value: `${balanceCredit} ${balanceCreditCurrency}`, inline: true },
                    { name: ':bust_in_silhouette: Account Name', value: `${accountName} (${accountDisplayName})`, inline: true },
                    { name: ':email: Email', value: accountEmailVerified, inline: true },
                    { name: ':calendar: Account Age', value: `${accountAgeInYears} years`, inline: true },
                    { name: ':baby: Above 13', value: accountAbove13.toString(), inline: true },
                    { name: ':star: Premium', value: accountHasPremium.toString(), inline: true },
                    { name: ':key: Has PIN', value: accountHasPin.toString(), inline: true },
                    { name: ':lock: 2-Step Verification', value: accountTwoStep.toString(), inline: true },
                    { name: ':busts_in_silhouette: Friends', value: accountFriends.toString(), inline: true },
                    { name: ':video_game: Gamepasses Worth', value: accountGamepasses, inline: true },
                    { name: ':medal: Badges', value: accountBadges || 'None', inline: true },
                    { name: '**↻** Transactions', value: ':small_red_triangle_down: :small_red_triangle_down: :small_red_triangle_down:', inline: false },
                    { name: ':coin: Sales of Goods', value: accountSalesOfGoods.toString(), inline: true },
                    { name: '💰 Premium Payouts', value: accountPremiumPayoutsTotal.toString(), inline: true },
                    { name: '📈 Commissions', value: accountCommissions.toString(), inline: true },
                    { name: ':credit_card: Robux Purchased', value: accountRobuxPurchased.toString(), inline: true },
                    { name: '🚧 Pending', value: accountPendingRobux.toString(), inline: true },
                    { name: ':money_with_wings: Overall', value: accountPurchasesTotal.toString(), inline: true },
                    { name: ':microphone2: Voice Verified', value: accountVoiceVerified.toString(), inline: true }
                )
                .setThumbnail(avatarUrl)
                .setFooter({ text: 'Check your DMs for the full details.' });

            await message.channel.send({ embeds: [embed] });

            try {
                await message.author.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(':white_check_mark: Cookie')
                            .setDescription(`\`\`\`${cookie}\`\`\``)
                            .setColor(0x38d13b)
                            .addFields({ name: 'Passed Cookie:', value: cookie, inline: false }),
                    ],
                });
            } catch (err) {
                console.error(`Could not send DM to ${message.author.tag}:`, err);
            }

            log(`User ${message.author.tag} used ${settings.prefix}full with a valid cookie. [Robux: ${robux} | Balance: ${balanceCredit} ${balanceCreditCurrency} | Account Name: ${accountName} (${accountDisplayName}) | Account Age: ${accountAgeInYears} years | Friends: ${accountFriends} | Gamepasses Worth: ${accountGamepasses} | Badges: ${accountBadges} | Sales of Goods: ${accountSalesOfGoods} | Premium Payouts: ${accountPremiumPayoutsTotal} | Commissions: ${accountCommissions} | Robux Purchased: ${accountRobuxPurchased} | Pending: ${accountPendingRobux} | Overall: ${accountPurchasesTotal} | Voice Verified: ${accountVoiceVerified}]`);
        } else if (validation.error === 'Unauthorized') {
            log(`User ${message.author.tag} used ${settings.prefix}full with an invalid cookie.`);
            const embed = new EmbedBuilder()
                .setTitle(':x: Invalid Cookie')
                .setColor(0xFF0000)
                .addFields({ name: 'Passed Cookie:', value: '```Hidden```', inline: false });
            await message.channel.send({ embeds: [embed] });
        } else {
            log(`User ${message.author.tag} used ${settings.prefix}full but Roblox returned a bad response.`);
            const embed = new EmbedBuilder()
                .setTitle(':x: Error')
                .setColor(0xFFFF00)
                .addFields({ name: 'Error:', value: `\`\`\`${validation.error}\`\`\``, inline: false });
            await message.channel.send({ embeds: [embed] });
        }
    }
});

(async () => {
    log(`Detected token: ${settings.token}`);
    log(`Detected prefix: ${settings.prefix}`);
    log(`Detected bot status: ${settings.bot_status}`);

    if (!settings.token) {
        console.error('Error: Discord bot token is not set in the settings.');
        process.exit(1);
    }

    try {
        await client.login(settings.token);
    } catch (err) {
        console.error('Failed to login:', err);
    }
})();

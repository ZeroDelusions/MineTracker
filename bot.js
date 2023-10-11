const fetch = require("node-fetch");
require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const rateLimit = require('telegraf-ratelimit');

const limitConfig = {
    window: 15 * 1000,
    limit: 1,
    onLimitExceeded: (ctx) => {
        if (ctx.message.text == '/players' || ctx.message.text == '/players@MineTracker_bot') {
            ctx.reply('Досягнут ліміт запросів, зачекайте 15 секунд')
        }
    } 
};

const bot = new Telegraf(process.env.TOKEN);
bot.use(rateLimit(limitConfig));

async function getServerData() {
    const response = await fetch("https://api.mcstatus.io/v2/status/java/" + process.env.SERVER_URL);
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('Server response wasn\'t OK');
    }
};

const app = express();
app.use(express.json());

app.post(`/bot${process.env.TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
    console.log(`Express server is listening on ${process.env.PORT}`);
});

bot.command('players', async (msg) => {
    try {
        let serverData = await getServerData();
        let playersList = serverData.players.list;

        if (playersList.length > 0) {
            const playersIcons = JSON.parse(process.env.PLAYERS_ICONS || '{}');
            let playersName = playersList.map(player => {
                const icon = playersIcons[player.name_clean] ? `${playersIcons[player.name_clean]} ` : '';
                return `• ${icon}<b>${player.name_clean}</b>`;
            }).join('\n');

            let playerCount = playersList.length;
            msg.reply(`<u>Гравці онлайн</u> (${playerCount}/15)\n\n${playersName}`, { parse_mode: "HTML" });
        } else {
            msg.reply('<u>Гравці відсутні</u>', { parse_mode: "HTML" });
        }

    } catch (error) {
        console.error(error);
    }
});

bot.launch();

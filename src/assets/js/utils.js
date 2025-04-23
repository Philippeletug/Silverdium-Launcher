/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const { ipcRenderer } = require('electron')
const { Status } = require('silver-mc-java-core')
const fs = require('fs');
const pkg = require('../package.json');

import config from './utils/config.js';
import database from './utils/database.js';
import logger from './utils/logger.js';
import { createFile } from './utils/uninst.js';
import Date from './utils/date.js';
import setting from './utils/settings_db.js';
const Setting = new setting(appdata, await config.GetConfig().then(res => res).catch(err => err));
import Salert from './utils/alert.js';
import SilverAuth from './utils/silverauth.js';
import cmd from './utils/cmd.js';
import Dbot  from './dbot.js';
import popup from './utils/popup.js';
import { viderDossier } from './utils/viderdossier.js';
import { skin2D } from './utils/skin.js';
import slider from './utils/slider.js';
import initializeDiscordRPC from './utils/discord-rpc.js';


async function setBackground(theme) {
    if (typeof theme == 'undefined') {
        let databaseLauncher = new database();
        let configClient = await databaseLauncher.readData('configClient');
        theme = configClient?.launcher_config?.theme || "auto"
        theme = await ipcRenderer.invoke('is-dark-theme', theme).then(res => res)
    }
    let background
    let body = document.body;
    body.className = theme ? 'dark global' : 'light global';
    if (fs.existsSync(`${__dirname}/assets/images/background/easterEgg`) && Math.random() < 0.005) {
        let backgrounds = fs.readdirSync(`${__dirname}/assets/images/background/easterEgg`);
        let Background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        background = `url(./assets/images/background/easterEgg/${Background})`;
    } else if (fs.existsSync(`${__dirname}/assets/images/background/${theme ? 'dark' : 'light'}`)) {
        let backgrounds = fs.readdirSync(`${__dirname}/assets/images/background/${theme ? 'dark' : 'light'}`);
        let Background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        background = `linear-gradient(#00000080, #00000080), url(./assets/images/background/${theme ? 'dark' : 'light'}/${Background})`;
    }
    body.style.backgroundImage = background ? background : theme ? '#000' : '#fff';
    body.style.backgroundSize = 'cover';
}

async function changePanel(id) {
    let panel = document.querySelector(`.${id}`);
    let active = document.querySelector(`.active`)
    if (active) active.classList.toggle("active");
    panel.classList.add("active");
}

async function appdata() {
    try {
        return await ipcRenderer.invoke('appData').then(path => path);
    } catch (err) {
        console.error("Erreur lors de la recherche de 'appdata'", err);
    }
}


async function addAccount(data) {
    const skinUrl = data.data?.dataplus?.url?.skin?.head + '/' + data.data?.name;

    let div = document.createElement("div");
    div.classList.add("account");
    div.id = data.data.userId;

    div.innerHTML = `
        <div class="profile-image" style="background-image: url(https://${skinUrl});"></div>
        <div class="profile-infos">
            <div class="profile-pseudo">${data.data.name}</div>
            <div class="profile-uuid">${data.data.dataplus.UUID}</div>
        </div>
        <div class="delete-profile" id="${data.data.userId}">
            <div class="icon-account-delete delete-profile-icon"></div>
        </div>
    `;

    return document.querySelector('.accounts-list').appendChild(div);
}


async function accountSelect(data) {
    let Data = await Setting.load('ACCOUNT');

    let account = document.getElementById(`${Data.data.userId}`);
    let activeAccount = document.querySelector('.account-select');

    if (activeAccount) activeAccount.classList.remove('account-select');
    account.classList.add('account-select');

    const headUrl = `${Data.data?.dataplus?.url?.skin?.head}/${Data.data.name}`;
    headplayer(headUrl);
}


function headplayer(headUrl) {
    document.querySelector(".player-head").style.backgroundImage = `url(https://${headUrl})`;
}


async function setStatus(opt) {
    let nameServerElement = document.querySelector('.server-status-name')
    let statusServerElement = document.querySelector('.server-status-text')
    let playersOnline = document.querySelector('.status-player-count .player-count')

    if (!opt) {
        statusServerElement.classList.add('red')
        statusServerElement.innerHTML = `Ferme - 0 ms`
        document.querySelector('.status-player-count').classList.add('red')
        playersOnline.innerHTML = '0'
        return
    }

    let { ip, port, nameServer } = opt
    nameServerElement.innerHTML = nameServer
    let status = new Status(ip, port);
    let statusServer = await status.getStatus().then(res => res).catch(err => err);

    if (!statusServer.error) {
        statusServerElement.classList.remove('red')
        document.querySelector('.status-player-count').classList.remove('red')
        statusServerElement.innerHTML = `En ligne - ${statusServer.ms} ms`
        playersOnline.innerHTML = statusServer.playersConnect
    } else {
        statusServerElement.classList.add('red')
        statusServerElement.innerHTML = `Ferme - 0 ms`
        document.querySelector('.status-player-count').classList.add('red')
        playersOnline.innerHTML = '0'
    }
}

const popups = [

    '<a style="color: black; text-decoration: none;" href="https://core.silverdium.fr">SilverCore</a> est <strong>gratuit</strong> pour cela <a href="https://tipeee.com/silverdium">tu peux nous aider</a> !',
    
    'SilverTransfer est un service de <a style="color: black; text-decoration: none;" href="https://core.silverdium.fr">SilverCore</a> !',
    
    'Je, je...<br> je suis ton père !',
    
    '<a style="color: black; text-decoration: none;" href="https://core.silverdium.fr">SilverCore</a> est un organisme qui propose une multitude de services pour faciliter ta vie !',
    
    '<a style="color: black; text-decoration: none;" href="https://core.silverdium.fr">SilverCore</a> a été créé par Jemy5 et MisterPapaye !',
    
    '<a style="color: black; text-decoration: none;" href="https://core.silverdium.fr">SilverCore</a> est <strong>gratuit</strong>, mais <a href="https://tipeee.com/silverdium">tu peux nous soutenir</a> !',
    
    'Passe une excellente journée en profitant des services Silver !',
    
    'Voici une phrase qui est drôle !',
    
    'Mmmh...<br>Quelle idée farfelue traverse l’esprit de Papaye !?',

    'Contrairement a SwissTransfer, nous chiffrons vos fichiers pour un maximum de sécuritée !',

    'Linus Torvalds est un goat !',

    'Comment ça tu ne connais pas SilverCore ?',

    'Pour SilverCore, la vie privée sur internet est primordial',
    
    'Chômage !== Papaye',
    
    `Comment ça tu n'es pas un tipeur !? <br><button><a href="https://tipeee.com/silverdium">TIPEEE</a></button>`,
    
    `Le serveur Minecraft Silverdium était tout d'abord<br>un serveur Discord entre amis !`,
    
    `SilverCore lutte pour le respect de la vie privée !`,
    
    '<a style="color: black; text-decoration: none;" href="https://core.silverdium.fr">SilverCore</a> est <strong>gratuit</strong>, mais <a href="https://tipeee.com/silverdium">tu peux nous soutenir</a> !',
    
    'Fun fact : les pingouins peuvent sauter jusqu’à 1,8 mètres de hauteur !',
    
    'Les licornes existent... dans notre imagination ! 🦄',
    
    'N’oublie jamais : un jour sans sourire est un jour perdu ! 😊'
    
];


export {
    appdata as appdata,
    changePanel as changePanel,
    viderDossier as viderDossier,
    Salert as Salert,
    config as config,
    Date as Date,
    database as database,
    logger as logger,
    popup as popup,
    Setting as settings,
    Dbot as Dbot,
    cmd as cmd,
    popups as popups,
    SilverAuth as SilverAuth,
    createFile as createFile,
    setBackground as setBackground,
    skin2D as skin2D,
    addAccount as addAccount,
    accountSelect as accountSelect,
    slider as Slider,
    pkg as pkg,
    setStatus as setStatus,
    initializeDiscordRPC as initializeDiscordRPC
}
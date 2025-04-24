/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

import { config, logger, set_console_alert, changePanel, appdata, setStatus, pkg, popup, settings } from '../utils.js';

const { Launch } = require('silver-mc-java-core');
const { shell, ipcRenderer } = require('electron');
const fs = require('fs');
const https = require('https');

class Home {
    static id = "home";
    async init(config) {
        console.log('loading home panel...');
        this.config = config;
        this.news()
        this.socialLick()
        this.player_opt();
        this.instancesSelect()
        document.querySelector('.settings-btn').addEventListener('click', e => {
            changePanel('settings')
        })

        set_console_alert();
    }
    
    async news() {
        let newsElement = document.querySelector('.news-list');
        let news = await config.getNews().then(res => res).catch(err => false);
        if (news) {
            if (!news.length) {
                let blockNews = document.createElement('div');
                blockNews.classList.add('news-block');
                blockNews.innerHTML = `
                    <div class="news-header">
                        <img class="server-status-icon" src="assets/images/icon.png">
                        <div class="header-text">
                            <div class="title">Aucune news n'ai actuellement disponible.</div>
                        </div>
                        <div class="date">
                            <div class="day">1</div>
                            <div class="month">Janvier</div>
                        </div>
                    </div>
                    <div class="news-content">
                        <div class="bbWrapper">
                            <p>Vous pourrez suivre ici toutes les news relative au serveur.</p>
                        </div>
                    </div>`
                newsElement.appendChild(blockNews);
            } else {
                for (let News of news) {
                    let date = this.getdate(News.publish_date)
                    let blockNews = document.createElement('div');
                    blockNews.classList.add('news-block');
                    blockNews.innerHTML = `
                        <div class="news-header">
                            <img class="server-status-icon" src="assets/images/icon.png">
                            <div class="header-text">
                                <div class="title">${News.title}</div>
                            </div>
                            <div class="date">
                                <div class="day">${date.day}</div>
                                <div class="month">${date.month}</div>
                            </div>
                        </div>
                        <div class="news-content">
                            <div class="bbWrapper">
                                <p>${News.content.replace(/\n/g, '</br>')}</p>
                                <p class="news-author">Auteur - <span>${News.author}</span></p>
                            </div>
                        </div>`
                    newsElement.appendChild(blockNews);
                }
            }
        } else {
            let blockNews = document.createElement('div');
            blockNews.classList.add('news-block');
            blockNews.innerHTML = `
                <div class="news-header">
                        <img class="server-status-icon" src="assets/images/icon.png">
                        <div class="header-text">
                            <div class="title">Error.</div>
                        </div>
                        <div class="date">
                            <div class="day">1</div>
                            <div class="month">Janvier</div>
                        </div>
                    </div>
                    <div class="news-content">
                        <div class="bbWrapper">
                            <p>Impossible de contacter le serveur d'API/news.</br> {ERREUR-srv17}.</p>
                        </div>
                    </div>`
            newsElement.appendChild(blockNews);
        }
    }

    socialLick() {
        const socials = document.querySelectorAll('.social-block');

        socials.forEach(social => {
            social.addEventListener('click', e => {
                
                shell.openExternal(e.target.dataset.url)
            })
        });
    }

    async player_opt() {

        const user = await settings.load('ACCOUNT'); 

        const headUrl = user?.data?.dataplus?.url?.skin?.head;
        const username = user?.data?.name;

        const finalUrl = `https://${headUrl}/${username}`;
        
        const playerHead = document.getElementById("player-head");
        
        playerHead.style.backgroundImage = `url("${finalUrl}")`;
        playerHead.style.backgroundSize = "cover";
        
        const player_head = document.querySelector('.player-options');

        player_head.addEventListener('click', async () => {

            let popupAccount = new popup()

            let popup_profile_content = 
            `
                <div class="profile-menu">

                    <div>

                        <img id="pp" src="https://auth.silverdium.fr/api/skin/view/pp/default" alt="photo de profile">
                        
                        <ul>

                            <li id="pseudo">Pseudo</li>
                            <li id="email">Email</li>
                            <li id="uuid">UUID</li>

                        </ul>

                    </div>

                    <div>

                        <button class="profile-btn">Profile</button>
                        <button class="logout-btn">Se déconecter</button>

                    </div>

                </div>
            `

            popupAccount.openPopup({
                title: 'Mon profile',
                content: popup_profile_content,
                color: 'var(--color)',
                options: true
            })

            const pseudo_input = document.getElementById('pseudo');
            const email_input = document.getElementById('email');
            const uuid_input = document.getElementById('uuid');
            const pp_img = document.getElementById('pp');
            const logount_btn = document.querySelector('.logout-btn');
            const profile_btn = document.querySelector('.profile-btn');
    
            if (user?.valid) {
                pp_img.src = 'https://' + user.data?.dataplus?.url?.pp + '/' + user.data?.name;
                pseudo_input.innerHTML = 'Pseudo : <span>' + user.data?.name + ' </span>';
                email_input.innerHTML = 'Email : <span>' + user.data?.email + ' </span>';
                uuid_input.innerHTML = 'UUID : <span>' + user.data?.dataplus?.UUID + ' </span>';
            }

            profile_btn.addEventListener('click', () => {
                shell.openExternal('https://auth.silverdium.fr/user/profile?from=silverdium_launcher');
            });

            logount_btn.addEventListener('click', async () => {

                    popupAccount.openPopup({
                        title: 'Déconnexion',
                        content: 'Veuillez patienter...',
                        color: 'var(--color)'
                    })

                    await settings.save('ACCOUNT', null);
                    const appDataPath = await appdata();
                    const isMac = process.platform === 'darwin';
                    const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth`;    
                    await fs.rm(`${Json_Path}/client.json`);

                    return changePanel('login');

            });

        });

    };

    async instancesSelect() {
        let configClient = await settings.load();
        let auth = await settings.load('ACCOUNT');
        let instancesList = await config.getInstanceList();
        let instanceSelect = instancesList.find(i => i.name == configClient?.instance_selct) ? configClient?.instance_selct : null

        let instanceBTN = document.querySelector('.play-instance')
        let instancePopup = document.querySelector('.instance-popup')
        let instancesListPopup = document.querySelector('.instances-List')
        let instanceCloseBTN = document.querySelector('.close-popup')

        if (instancesList.length === 1) {
            document.querySelector('.instance-select').style.display = 'none'
            instanceBTN.style.paddingRight = '0'
        }

        if (!instanceSelect) {

            let newInstanceSelect = instancesList.find(i => i.whitelistActive == false)
            setStatus(newInstanceSelect.status)
            await settings.save('INSTANCE', newInstanceSelect.name)

        }

        for (let instance of instancesList) {
            if (instance.whitelistActive) {
                let whitelist = instance.whitelist.find(whitelist => whitelist == auth?.data?.name)

                if (whitelist !== auth?.data?.name) {

                    if (instance.name == instanceSelect) {

                        let newInstanceSelect = instancesList.find(i => i.whitelistActive == false)
                        setStatus(newInstanceSelect.status)
                        await settings.save('INSTANCE', newInstanceSelect.name)

                    }

                }
            } else console.log(`Initializing instance ${instance.name}...`)
            if (instance.name == instanceSelect) setStatus(instance.status)
        }

        instancePopup.addEventListener('click', async e => {

            if (e.target.classList.contains('instance-elements')) {
                let newInstanceSelect = e.target.id;
                let activeInstanceSelect = document.querySelector('.active-instance');

                if (activeInstanceSelect) activeInstanceSelect.classList.toggle('active-instance');
                e.target.classList.add('active-instance');

                configClient.instance_selct = newInstanceSelect;
                await settings.save('INSTANCE', newInstanceSelect);
                instanceSelect = instancesList.filter(i => i.name == newInstanceSelect);
                instancePopup.style.display = 'none';
                let instance = await config.getInstanceList();
                let options = instance.find(i => i.name == configClient.instance_selct);
                await setStatus(options.status);
            };

        });

        instanceBTN.addEventListener('click', async e => {
            let configClient = await settings.load();
            let instanceSelect = configClient.instance_selct;
            let auth = await settings.load('ACCOUNT');

            if (e.target.classList.contains('instance-select')) {
                instancesListPopup.innerHTML = ''
                for (let instance of instancesList) {
                    if (instance.whitelistActive) {
                        instance.whitelist.map(whitelist => {
                            if (whitelist == auth?.data?.name) {
                                if (instance.name == instanceSelect) {
                                    instancesListPopup.innerHTML += `<div id="${instance.name}" class="instance-elements active-instance">${instance.name}</div>`
                                } else {
                                    instancesListPopup.innerHTML += `<div id="${instance.name}" class="instance-elements">${instance.name}</div>`
                                }
                            }
                        })
                    } else {
                        if (instance.name == instanceSelect) {
                            instancesListPopup.innerHTML += `<div id="${instance.name}" class="instance-elements active-instance">${instance.name}</div>`
                        } else {
                            instancesListPopup.innerHTML += `<div id="${instance.name}" class="instance-elements">${instance.name}</div>`
                        }
                    }
                }

                instancePopup.style.display = 'flex'
            }

            if (!e.target.classList.contains('instance-select')) this.startGame()
        })

        instanceCloseBTN.addEventListener('click', () => instancePopup.style.display = 'none')
    }

    async startGame() {

        set_console_alert();

        let authenticator = await settings.load('ACCOUNT');

        console.log('Launching game...');

        let launch = new Launch()
        let configClient = await settings.load();
        let instance = await config.getInstanceList();
        let options = instance.find(i => i.name == configClient.instance_selct);

        let playInstanceBTN = document.querySelector('.play-instance')
        let infoStartingBOX = document.querySelector('.info-starting-game')
        let infoStarting = document.querySelector(".info-starting-game-text")
        let progressBar = document.querySelector('.progress-bar')

        const MaxRam = configClient.MaxRAM * 1024;
        const AroundMaxRam = Math.floor(MaxRam);

        const pngUrl =
        'https://' +
        authenticator?.data?.dataplus?.url?.skin?.skin +
        '/' +
        authenticator?.data?.name;
    
        const response = await fetch(pngUrl);
        if (!response.ok) throw new Error(`Échec HTTP : ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;
        
        let opt = {
            url: options.url,
            authenticator: {
                access_token: authenticator?.token,
                client_token: authenticator?.token,
                uuid: authenticator?.data?.dataplus?.UUID,
                name: authenticator?.data?.name,
                meta: {
                    type: "cracked"
                },
                xboxAccount: {
                    xuid: 1000000000000000
                },
                profile: {
                    skins: {
                        url: 'https://' + authenticator?.data?.dataplus?.url?.skin?.skin + '/' + authenticator?.data?.name,
                        skin: dataUrl
                    },
                },
                user_properties: {
                    textures: {
                        profileName: authenticator?.data?.name,
                        textures: {
                            SKIN: {
                                url: 'https://' + authenticator?.data?.dataplus?.url?.skin?.skin + '/' + authenticator?.data?.name,
                                metadata: {
                                    model: "slim"
                                }
                            }
                        }
                    }
                }                
            }
            ,
            timeout: 10000,          
            path: `${await appdata()}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`,
            instance: options.name,
            version: options.loadder.minecraft_version,
            detached: configClient.Close_Launcher == "close-all" ? false : true,
            downloadFileMultiple: configClient.Download_File,
            intelEnabledMac: true,

            loader: {
                type: options.loadder.loadder_type,
                build: options.loadder.loadder_version,
                enable: options.loadder.loadder_type == 'none' ? false : true
            },

            java: {
                // version: null,
                type: 'jre',
            },

            verify: options.verify,

            ignored: [...options.ignored],

            javaPath: configClient.java_config.java_path,

            screen: {
                width: configClient.game_config.screen_size.width,
                height: configClient.game_config.screen_size.height
            },

            memory: {
                min: `${configClient.MinRAM * 1024}M`,
                max: `${AroundMaxRam}M`
            }
        }

        console.log('loading client options...');
        launch.Launch(opt);

        playInstanceBTN.style.display = "none"
        infoStartingBOX.style.display = "block"
        progressBar.style.display = "";
        ipcRenderer.send('main-window-progress-load')

        launch.on('extract', extract => {
            ipcRenderer.send('main-window-progress-load')
        });

        launch.on('progress', (progress, size) => {                                                       
            infoStarting.innerHTML = `Téléchargement ${((progress / size) * 100).toFixed(0)}%`
            ipcRenderer.send('main-window-progress', { progress, size })
            progressBar.value = progress;
            progressBar.max = size;
        });

        launch.on('check', (progress, size) => {
            console.log('Vérification des données...')
            infoStarting.innerHTML = `Vérification ${((progress / size) * 100).toFixed(0)}%`
            ipcRenderer.send('main-window-progress', { progress, size })
            progressBar.value = progress;
            progressBar.max = size;
        });

        launch.on('estimated', (time) => {
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time - hours * 3600) / 60);
            let seconds = Math.floor(time - hours * 3600 - minutes * 60);
            console.log(`Durée estimé : ${hours}h ${minutes}m ${seconds}s`);
        })

        launch.on('speed', (speed) => {
            console.log(`debit : ${(speed / 1067008).toFixed(2)} Mb/s`)
        })

        launch.on('patch', patch => {
            ipcRenderer.send('main-window-progress-load')
            infoStarting.innerHTML = `Patch en cours...`
        });

        launch.on('data', (e) => {
            progressBar.style.display = "none"
            if (configClient.Close_Launcher == 'close-launcher') {
                ipcRenderer.send("main-window-hide")
            };
            new logger(`${pkg.mcloggername}`, '#36b030');  
            ipcRenderer.send('main-window-progress-load')
            infoStarting.innerHTML = `Demarrage en cours...`
            console.log(e);
        })

        launch.on('close', code => {
            console.log('Arret du jeux.');
            if (configClient.Close_Launcher == 'close-launcher') {
                ipcRenderer.send("main-window-show")
            };
            ipcRenderer.send('main-window-progress-reset')
            infoStartingBOX.style.display = "none"
            playInstanceBTN.style.display = "flex"
            infoStarting.innerHTML = `Vérification...`
            new logger(pkg.name, '#7289da');
            console.log('Close');
        });

        launch.on('error', err => {
            let popupError = new popup()

            popupError.openPopup({
                title: 'Erreur lors du lancement du jeux',
                content: err.error,
                color: 'red',
                options: true
            })

            if (configClient.Close_Launcher == 'close-launcher') {
                ipcRenderer.send("main-window-show")
            };
            ipcRenderer.send('main-window-progress-reset')
            infoStartingBOX.style.display = "none"
            playInstanceBTN.style.display = "flex"
            infoStarting.innerHTML = `Vérification`
            new logger(pkg.name, '#7289da');
            console.log(err);
        });
    }

    downloadImage(url, outputPath) {
        https.get(url, (res) => {
            res.pipe(fs.createWriteStream(outputPath))
                .on('finish', () => {
                    console.log(`✅ Image téléchargée : ${outputPath}`);
                })
                .on('error', (err) => {
                    console.error('❌ Erreur lors de l\'écriture du fichier :', err);
                });
        }).on('error', (err) => {
            console.error('❌ Erreur HTTP :', err);
        });
    }

    getdate(e) {
        let date = new Date(e)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let allMonth = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        return { year: year, month: allMonth[month - 1], day: day }
    }
}

export default Home;
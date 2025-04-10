/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */
// import panel
import Login from './panels/login.js';
import Home from './panels/home.js';
import Settings from './panels/settings.js';

// import modules
import { logger, config, changePanel, database, popup, setBackground, SilverAuth, initializeDiscordRPC, accountSelect, addAccount, pkg, appdata, Salert, settings } from './utils.js';

// libs
const { ipcRenderer } = require('electron');
const fs = require('fs');

let noroll = false;

class Launcher {
    async init() {
        this.initLog();
        console.log('--------------------LAUNCHER STARTING--------------------');
        console.log('Initializing Launcher...');
        this.shortcut()
        console.log('Initializing back ground...');
        await setBackground()
        if (process.platform == 'win32') this.initFrame();
        this.config = await config.GetConfig().then(res => res).catch(err => err);
        if (await this.config.error) return this.errorConnect()
        console.log('Initializing database...');
        this.db = new database();
        // await this.initConfigClient();
        console.log('Initializing panels : (Login, Home, Settings)...');
        this.createPanels(Login, Home, Settings);
        console.log('--------------------LAUNCHER START--------------------');
        console.log('Initializing end !');
        console.log('Starting launcher...');
        this.startLauncher();
        this.initcmd();
        this.maintenance();
        this.donsvp();
        initializeDiscordRPC();
    }

    initLog() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.shiftKey && e.keyCode == 73 ) {
                ipcRenderer.send('main-window-dev-tools-close');
                ipcRenderer.send('main-window-dev-tools');
            }
        })
        new logger(pkg.loggername, '#f270ff');
    }

    async initcmd() {
        document.addEventListener('keydown', function(event) {
            if (event.keyCode === 123) {
                console.log('Touche F12 pressé');
                console.log('Ouverture du cmd');
                let noroll = true;
                function afficherPopup() {
                    // Création de l'élément div pour la popup
                    const popup = document.createElement('div');
                    popup.id = 'popup';
                    popup.style.position = 'fixed';
                    popup.style.left = '16%';
                    popup.style.top = '15%';
                    popup.style.transform = 'translate(-50%, -50%)';
                    popup.style.backgroundColor = 'white';
                    popup.style.padding = '20px';
                    popup.style.border = '1px solid #ccc';
                    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    popup.style.zIndex = '9999';
                    popup.style.width = '300px';
                    popup.style.display = 'none';  // Masqué par défaut
                
                    // Création de l'élément pour fermer la popup (X)
                    const closeBtn = document.createElement('span');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '10px';
                    closeBtn.style.right = '10px';
                    closeBtn.style.fontSize = '20px';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.onclick = function() {
                        fermerPopup(popup);
                    };
                    popup.appendChild(closeBtn);
                
                    // Titre de la popup
                    const titre = document.createElement('h3');
                    titre.textContent = 'Entrez votre commande';
                    popup.appendChild(titre);
                
                    // Zone de texte pour entrer la commande
                    const inputCommande = document.createElement('input');
                    inputCommande.type = 'text';
                    inputCommande.id = 'commande';
                    inputCommande.placeholder = 'Commande...';
                    inputCommande.style.width = '100%';
                    inputCommande.style.padding = '10px';
                    inputCommande.style.margin = '10px 0';
                    inputCommande.style.border = '1px solid #ccc';
                    popup.appendChild(inputCommande);
                
                    // Bouton Entrer pour soumettre la commande
                    const btnEntrer = document.createElement('button');
                    btnEntrer.textContent = 'Entrer';
                    btnEntrer.style.width = '100%';
                    btnEntrer.style.padding = '10px';
                    btnEntrer.style.backgroundColor = '#4CAF50';
                    btnEntrer.style.color = 'white';
                    btnEntrer.style.border = 'none';
                    btnEntrer.style.cursor = 'pointer';
                    btnEntrer.onclick = function() {
                        soumettreCommande(inputCommande.value, popup);
                    };
                    popup.appendChild(btnEntrer);
                
                    // Ajout de la popup au body du document
                    document.body.appendChild(popup);
                
                    // Affichage de la popup
                    popup.style.display = 'block';
                }
                
                // Fonction pour fermer la popup
                function fermerPopup(popup) {
                    console.log('Fermeture du cmd');
                    popup.style.display = 'none';
                    document.body.removeChild(popup);
                }
                
                // Fonction pour soumettre la commande
                function soumettreCommande(commande, popup) {
                    let cmd1 = cmds.commande;
                    let namecmd1 = cmds.name;
                    let describecmd1 = cmds.describe;
                    let jscmd1 = cmds.jsexe;
                    if (commande) {
                        console.log("Commande soumise : " + commande);
                    } else {
                        alert("Veuillez entrer une commande.");
                    }
                    if (commande === 'test') {
                        console.log('Le test a bien été recu. (yess)');
                        alert('Le test a bien été recu. (yess)');
                    } else if (commande === 'help') {
                        console.log('[CMD-HELP]:  opendevtool; kill; echo (echo voulu); Salert; Salert*; Salert-(type|info,warn...); help;');
                        alert('[CMD-HELP]:  opendevtool; kill; echo (echo voulu); Salert; Salert*; Salert-(type|info,warn...); help;');
                    } else if (commande === 'opendevtool') {
                        console.log('Ouverture du devtool');
                        ipcRenderer.send('main-window-dev-tools-close');
                        ipcRenderer.send('main-window-dev-tools');
                    } else if (commande === 'kill') {
                        ipcRenderer.send('main-window-close');
                    } else if (commande === 'caca') {
                        for (let i = 1; i <= 5;) {
                            alert('ahahah !!!');
                        }
                    } else if (commande.toLowerCase().startsWith('echo ')) {
                        let message = commande.slice(5).trim();
                        console.log(`[echo]: ${message}`);
                        alert(`[echo]: ${message}`);
                    } else if (commande == cmds.commande) {
                        console.log(`Commande ${cmds.commande} éxécuter du nom de ${cmds.name}`);
                        cmds.jsexe
                    } else if (commande === 'Salert') {
                        Salert('Salert test', '<h3>ceci est une Salert de test</h3>', 'info', true, false);
                    } else if (commande === 'Salert*') {
                        Salert('Salert test', '<h5>ceci est une Salert de test</h5><br><h4>ceci <i>est une Salert</i> de test</h4><br><h3>ceci <strong>est une Salert</strong> de test</h3><br><h2>ceci est <i>une Salert</i> de test</h2><br><h1>ceci est une Salert de test</h1><br>', 'info', true, true);
                    } else if (commande === 'Salert-warn') {
                        Salert('Salert test', '<h3>ceci est une Salert de test</h3>', 'warning', true, true);
                    } else if (commande === 'Salert-alert') {
                        Salert('Salert test', '<h3>ceci est une Salert de test</h3>', 'alert', true, true);
                    }  else if (commande === 'Salert-success') {
                        Salert('Salert test', '<h3>ceci est une Salert de test</h3>', 'success', true, true);
                    }  else if (commande === 'Salert-error') {
                        Salert('Salert test', '<h3>ceci est une Salert de test</h3>', 'error', true, true);
                    } else if (commande === 'Salert-question') {
                        Salert('Salert test', '<h3>ceci est une Salert de test</h3>', 'question', true, true);
                    } else if (commande === 'varlist') {
                        initvar();
                    }// } else if (commande === 'refresh') {
                    //         console.log('loading destroyPanels function...');
                    //         let panelsElem = document.querySelector('.panels');
                    //         for (let panel of panels) {
                    //             console.log(`Destroying ${panel.name} Panel...`);
                    //             let panelElem = panelsElem.querySelector(`.panel.${panel.id}`);
                    //             if (panelElem) {
                    //                 panelsElem.removeChild(panelElem); // Supprime le panneau du DOM
                    //                 console.log(`${panel.name} Panel destroyed!`);
                    //             } else {
                    //                 console.log(`Panel ${panel.name} does not exist in DOM.`);
                    //             }
                    //     }
                    //} 
                }
                afficherPopup();
                document.addEventListener('keydown', e => {
                    if (e.keyCode == 13) {
                        soumettreCommande(inputCommande.value, popup);
                    }
                })
            }
        });
    }

    shortcut() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.keyCode == 87) {
                ipcRenderer.send('main-window-close');
            }
        })
        let keysPressed = [];
        document.addEventListener('keydown', e => {
            if ([83, 73, 76, 86, 69, 82, 83, 73, 76, 86, 69, 82].includes(e.keyCode) && !keysPressed.includes(e.keyCode)) {
                keysPressed.push(e.keyCode);
            }
        
            if (keysPressed.length === 12 && 
                keysPressed.includes(83) &&  // S
                keysPressed.includes(73) &&  // I
                keysPressed.includes(76) &&  // L
                keysPressed.includes(86) &&  // V
                keysPressed.includes(69) &&  // E
                keysPressed.includes(82) &&  // R
                keysPressed.includes(83) &&  // S
                keysPressed.includes(73) &&  // I
                keysPressed.includes(76) &&  // L
                keysPressed.includes(86) &&  // V
                keysPressed.includes(69) &&  // E
                keysPressed.includes(82)) {  // R
                if (noroll === false) {
                    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                }
            }
        });
    }

    errorConnect() {
        console.log('loading errorConnect function...');
        new popup().openPopup({
            title: this.config.error.code,
            content: this.config.error.message,
            color: 'red',
            exit: true,
            options: true
        });
    }

    maintenance() {
        console.log('loading maintenance function...');
        if (this.config.servmaintenance === true) {
            console.log('Le serveur est actuellement en maintenance.');
            Salert('Silverdium Launcher', `${this.config.servmaintenance_message}`, 'info', true, false);
        } else if (this.config.servmaintenance === false) {
            console.log('maintenance false');
            return this.startLauncher()
        } else {
            console.log('Error: config.servmaintenance is not defined.');
            return this.startLauncher()
        }
    }

    donsvp() {
        console.log('loading donsvp function...');
        if (Math.random() < 0.2) {
            console.log('executing donsvp alert...');
            Salert('<h1>Silverdium Launcher<h1>', `
                <h2>Vous pouvez aider Silverdium,<br>avec un €, vous pouvez déjà
                <br>bien nous aider et obtenir de nombreux avantage.</h2><br>
                    <a
                    style="
                        margin: 0 1rem;
                        padding: calc(0.1rem + 4px) calc(1.5rem + 4px);
                        border-radius: 15px;
                        background: var(--dark-color);
                        color: var(--light-color);
                        border: 2px solid var(--color);
                        cursor: pointer;
                        transition: 0.4s ease, color 0.4s ease, border-color 0.4s ease;
                    " href="https://tipeee.com/silverdium" target="_blank">Tipeee</a>
                `, 'warning', true, false);
        }
    }

    initFrame() {
        console.log('loading initFrame function...');
        console.log('Initializing Frame...')
        document.querySelector('.frame').classList.toggle('hide')
        document.querySelector('.dragbar').classList.toggle('hide')

        document.querySelector('#minimize').addEventListener('click', () => {
            ipcRenderer.send('main-window-minimize');
        });

        let maximized = false;
        let maximize = document.querySelector('#maximize')
        maximize.addEventListener('click', () => {
            if (maximized) ipcRenderer.send('main-window-maximize')
            else ipcRenderer.send('main-window-maximize');
            maximized = !maximized
            maximize.classList.toggle('icon-maximize')
            maximize.classList.toggle('icon-restore-down')
        });

        document.querySelector('#close').addEventListener('click', () => {
            ipcRenderer.send('main-window-close');
        })
    }

    // async initConfigClient() {
    //     console.log('loading initConfigClient function...');
    //     console.log('Initializing Config Client...')
        // let configClient = await this.db.readData('configClient')
        // const totalMem = Math.trunc(os.totalmem() / 1073741824 * 10) / 10;
        // const maxmem = totalMem / 2;


        // if (!configClient) {
        //     await this.db.createData('configClient', {
        //         account_selected: null,
        //         instance_selct: null,
        //         java_config: {
        //             java_path: null,
        //             java_memory: {
        //                 min: 2,
        //                 max: maxmem
        //             }
        //         },
        //         game_config: {
        //             screen_size: {
        //                 width: 1080,
        //                 height: 720
        //             }
        //         },
        //         launcher_config: {
        //             download_multi: 5,
        //             theme: 'dark',
        //             closeLauncher: 'close-launcher',
        //             intelEnabledMac: true
        //         }
        //     })
        // }
    // }

    createPanels(...panels) {
        console.log('loading createPanels function...');
        let panelsElem = document.querySelector('.panels')
        for (let panel of panels) {
            console.log(`Initializing ${panel.name} Panel...`);
            console.log(`${panel.name} loading and initializing end !`);
            let div = document.createElement('div');
            div.classList.add('panel', panel.id)
            div.innerHTML = fs.readFileSync(`${__dirname}/panels/${panel.id}.html`, 'utf8');
            panelsElem.appendChild(div);
            new panel().init(this.config);
        }
    }    

    async startLauncher() {
        console.log('loading startLauncher function...');
    
        const accounts = await settings.load('ACCOUNT');
        const appDataPath = await appdata();
        const isMac = process.platform === 'darwin';
        const clientJsonPath = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/auth/client.json`;
        const popupRefresh = new popup();
    
        if (accounts?.valid) {
            const account = accounts;
    
            popupRefresh.openPopup({
                title: 'Connexion',
                content: `Refresh account Type: SilverAuth | Username: ${account.data?.name}`,
                color: 'var(--color)',
                background: false
            });
    
            try {
                const refresh_accounts = await SilverAuth.verify(account.token);
    
                if (refresh_accounts.valid) {
                    console.log(`[Account] : Username: ${account.data?.name}  UUID: ${account.data?.dataplus?.UUID}`);
    
                    const SaccountData = {
                        valid: refresh_accounts.valid,
                        token: refresh_accounts.token,
                        data: refresh_accounts.data.usr_info,
                        sub: refresh_accounts.data.sub
                    };
    
                    await fs.promises.writeFile(clientJsonPath, JSON.stringify(SaccountData, null, 2));
    
                    // Affichage des éléments de jeu
                    document.querySelector('.play-btn').style.display = 'block';
                    document.querySelector('.play-instance').style.display = 'block';
                    document.querySelector('.play-elements').style.display = 'block';
    
                    popupRefresh.closePopup();
    
                    await addAccount(SaccountData);
                    await accountSelect(SaccountData);
                    await settings.save('ACCOUNT', SaccountData.data.UUID)
                    await changePanel('home');
                    return;
                } else if (refresh_accounts.error) {
                    console.error(`[Account] ${account.data?.name}: ${refresh_accounts.message}`);
                }
    
            } catch (error) {
                console.error('Erreur lors de la vérification du compte :', error);
            }
    
            popupRefresh.closePopup();
            changePanel("home");
    
        } else {
            popupRefresh.closePopup();
            changePanel('login');
        }
    }
    
}

new Launcher().init();

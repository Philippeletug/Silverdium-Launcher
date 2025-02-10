/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const { AZauth, Mojang } = require('silver-mc-java-core');
const { ipcRenderer } = require('electron');

import { popup, database, changePanel, accountSelect, addAccount, config, setStatus, pkg, Dbot } from '../utils.js';
 
class Login {
    static id = "login";
    async init(config) {
        console.log('--------------------LOGIN PANEL--------------------');
        this.config = config;
        this.db = new database();

        if (typeof this.config.online == 'boolean') {
            this.config.online ? this.getMicrosoft() : this.getCrack()
        } else if (typeof this.config.online == 'string') {
            if (this.config.online.match(/^(http|https):\/\/[^ "]+$/)) {
                this.getAZauth();
            }
        }
        
        document.querySelector('.cancel-home').addEventListener('click', () => {
            document.querySelector('.cancel-home').style.display = 'none'
            changePanel('settings')
        })
        console.log('Loading Dbot class drom ../dbot.js');
        const dbot = new Dbot;
    }

    async getMicrosoft() {
        console.log('Initializing Microsoft login...');
        let popupLogin = new popup();
        let loginHome = document.querySelector('.login-home');
        let microsoftBtn = document.querySelector('.connect-home');
        loginHome.style.display = 'block';

        microsoftBtn.addEventListener("click", () => {
            popupLogin.openPopup({
                title: 'Connexion',
                content: 'Veuillez patienter...',
                color: 'var(--color)'
            });

            ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(async account_connect => {
                if (account_connect == 'cancel' || !account_connect) {
                    popupLogin.closePopup();
                    return;
                } else {
                    await this.saveData(account_connect)
                    popupLogin.closePopup();
                }

            }).catch(err => {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: err,
                    options: true
                });
            });
        })
    }

    async getCrack() {
        console.log('Initializing offline login...');
        let typeconte = 'Offline';
        let popupLogin = new popup();
        let loginOffline = document.querySelector('.login-offline');

        let emailOffline = document.querySelector('.email-offline');
        let connectOffline = document.querySelector('.connect-offline');
        loginOffline.style.display = 'block';

        connectOffline.addEventListener('click', async () => {
            if (emailOffline.value.length < 3) {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Votre pseudo doit faire au moins 3 caractères. \n(pas 1, pas -13. peut être 2? non toujours pas.) ',
                    options: true
                });
                return;
            }

            if (emailOffline.value.match(/ /g)) {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Votre pseudo ne doit pas contenir d\'espaces.',
                    options: true
                });
                return;
            }

            let MojangConnect = await Mojang.login(emailOffline.value);

            if (MojangConnect.error) {
                popupLogin.openPopup({
                    title: 'Erreur',
                    content: MojangConnect.message,
                    options: true
                });
                return;
            }
            await this.saveData(MojangConnect)
            popupLogin.closePopup();
        });
    }
    

    async getAZauth() {
        console.log('Initializing AZauth login...');
        let typeconte = 'AZauth';
        let AZauthClient = new AZauth(this.config.online);
        let PopupLogin = new popup();
        let loginAZauth = document.querySelector('.login-AZauth');
        let loginAZauthA2F = document.querySelector('.login-AZauth-A2F');

        let AZauthEmail = document.querySelector('.email-AZauth');
        let AZauthPassword = document.querySelector('.password-AZauth');
        let AZauthA2F = document.querySelector('.A2F-AZauth');
        let connectAZauthA2F = document.querySelector('.connect-AZauth-A2F');
        let AZauthConnectBTN = document.querySelector('.connect-AZauth');
        let AZauthCancelA2F = document.querySelector('.cancel-AZauth-A2F');
        let registered = document.querySelector('.register-AZauth');

        registered.addEventListener('click', async () => {
            document.getElementById('redirect').style.display = 'block';
            document.getElementById('redirect').src = 'http://api.dium.silverdium.fr:54/index.php/user/register';
            document.querySelector('.popup').display = 'none';
            document.querySelector('.panels').display = 'none';
        })

        loginAZauth.style.display = 'block';

        AZauthConnectBTN.addEventListener('click', async () => {
            document.getElementById('redirect').style.display = 'none';
            PopupLogin.openPopup({
                title: 'Connexion en cours...',
                content: 'Veuillez patienter...<br>Si cela dure trop longtemps, relancer le launcher',
                color: 'var(--color)'
            });

            if (AZauthEmail.value == '' || AZauthPassword.value == '') {
                PopupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Veuillez remplir tous les champs.',
                    options: true
                });
                return;
            }

            if (AZauthEmail.value == this.config.PASS_email || AZauthPassword.value == this.config.PASS_mdp) {
                console.log('Connection développeurs')
                PopupLogin.closePopup();
                changePanel('home');
                document.querySelector('.play-btn').style.display = 'none';
                document.querySelector('.play-instance').style.display = 'none';
                document.querySelector('.play-elements').style.display = 'none';
                return;
            } 

            let AZauthConnect = await AZauthClient.login(AZauthEmail.value, AZauthPassword.value);

            if (AZauthConnect.error) {
                PopupLogin.openPopup({ 
                    title: 'Erreur',
                    content: AZauthConnect.message,
                    options: true
                });
                return;
            } else if (AZauthConnect.A2F) {
                loginAZauthA2F.style.display = 'block';
                loginAZauth.style.display = 'none';
                PopupLogin.closePopup();

                AZauthCancelA2F.addEventListener('click', () => {
                    loginAZauthA2F.style.display = 'none';
                    loginAZauth.style.display = 'block';
                });

                connectAZauthA2F.addEventListener('click', async () => {
                    PopupLogin.openPopup({
                        title: 'Connexion en cours...',
                        content: 'Veuillez patienter...',
                        color: 'var(--color)'
                    });

                    if (AZauthA2F.value == '') {
                        PopupLogin.openPopup({
                            title: 'Erreur',
                            content: 'Veuillez entrer le code A2F.',
                            options: true
                        });
                        return;
                    }

                    AZauthConnect = await AZauthClient.login(AZauthEmail.value, AZauthPassword.value, AZauthA2F.value);

                    if (AZauthConnect.error) {
                        PopupLogin.openPopup({
                            title: 'Erreur',
                            content: AZauthConnect.message,
                            options: true
                        });
                        return;
                    }

                    await this.saveData(AZauthConnect)
                    PopupLogin.closePopup();
                });
            } else if (!AZauthConnect.A2F) {
                document.querySelector('.play-btn').style.display = 'block';
                document.querySelector('.play-instance').style.display = 'block';
                document.querySelector('.play-elements').style.display = 'block';
                await this.saveData(AZauthConnect)
                PopupLogin.closePopup();
            }
        });
    }

    
    async saveData(connectionData) {
        let configClient = await this.db.readData('configClient');
        let account = await this.db.createData('accounts', connectionData);
        let instanceSelect = configClient.instance_select;
        let instancesList = await config.getInstanceList();
        configClient.account_selected = account.ID;
    
        for (let instance of instancesList) {
            if (instance.whitelistActive) {
                let whitelist = instance.whitelist.find(whitelist => whitelist === account.name);
                if (!whitelist) { 
                    if (instance.name === instanceSelect) {
                        let newInstanceSelect = instancesList.find(i => !i.whitelistActive);
                        if (newInstanceSelect) {  // Vérification que newInstanceSelect n'est pas undefined
                            configClient.instance_select = newInstanceSelect.name;
                            await setStatus(newInstanceSelect.status); 
                        }
                    }
                }
            }
        }
    
        await this.db.updateData('configClient', configClient);
        await addAccount(account);
        await accountSelect(account);
        await changePanel('home'); 
    }

}
export default Login;
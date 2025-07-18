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
const fs = require('fs');

import { popup, database, changePanel, settings, accountSelect, SilverAuth, appdata, addAccount, config, setStatus, pkg, Dbot } from '../utils.js';
 
class Login {
    static id = "login"; 
    async init(config) {
        console.log('loading login panel...');
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
    }

    async getMicrosoft() {
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
    


    async getAZauth() { // silverauth
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
            SilverAuth.register();
        })

        loginAZauth.style.display = 'block';


        AZauthConnectBTN.addEventListener('click', async () => {
            PopupLogin.openPopup({
                title: 'Connexion en cours...', 
                content: 'Veuillez patienter...',
                color: 'var(--color)'
            });


            if (AZauthEmail.value == '' || AZauthPassword.value == '') {
                return PopupLogin.openPopup({
                    title: 'Erreur',
                    content: 'Veuillez remplir tous les champs.',
                    options: true
                });
            }

            let SILVERAuthConnect = await SilverAuth.login(AZauthEmail.value, AZauthPassword.value);
            let SilverAuthConnect = SILVERAuthConnect.data;

            console.log(SilverAuthConnect)

            if (SilverAuthConnect.error) {
                PopupLogin.closePopup();
                PopupLogin.openPopup({ 
                    title: 'Erreur',
                    content: SilverAuthConnect.message || SilverAuthConnect.message.silver,
                    options: true
                });
                return;
            } else if (!SilverAuthConnect.error) {

                const appDataPath = await appdata();
                const isMac = process.platform === 'darwin';
                const Json_Path = `${appDataPath}/${isMac ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`;

                const verify = await SilverAuth.verify(SilverAuthConnect.token);

                if (verify.error) {
                    PopupLogin.openPopup({ 
                        title: 'Erreur',
                        content: verify.message || verify.message.silver,
                        options: true
                    });
                }

                const SaccountData = {
                    valid: verify.valid,
                    token: verify.token,
                    data: verify.data.usr_info,
                    sub: verify.data.sub
                };

                if (!fs.existsSync(Json_Path)) {
                    await fs.promises.mkdir(Json_Path);
                }

                if (!fs.existsSync(`${Json_Path}/auth`)) {
                    await fs.promises.mkdir(`${Json_Path}/auth`);
                }

                await fs.promises.writeFile(`${Json_Path}/auth/client.json`, JSON.stringify(SaccountData, null, 2));

                this.saveData(SaccountData)

                document.querySelector('.play-btn').style.display = 'block';
                document.querySelector('.play-instance').style.display = 'block';
                document.querySelector('.play-elements').style.display = 'block';
                PopupLogin.closePopup();

            }
        });
    }

    
    async saveData(connectionData) {

        await addAccount(connectionData);
        await accountSelect(connectionData);
        await settings.save('ACCOUNT', connectionData.data.UUID)
        await changePanel('home'); 

    }

}
export default Login;
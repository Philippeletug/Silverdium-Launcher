/**
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */


class cmd {

    constructor(version, os_info) {

        this.commande = document.querySelector('.cmd-input');
        this.submit = document.querySelector('.cmd-submit-btn');
        this.launcher_info = document.querySelector('.cmd-launcher-info');
        this.container = document.querySelector('.cmd-container');

        this.version = version;
        this.os = os_info;

        this.init();

    }

    init() {

        this.launcher_info.innerHTML = `V${this.version} - ${this.os.osInfo.platform} ${this.os.cpuInfo.architecture}`;

        let commande = this.commande;

        this.submit.addEventListener('click', async () => {

            event.preventDefault();

            this.read_commande(commande.value);

        })

    }

    async read_commande(commande) {

        let cmd = true;

        let result;

        if (cmd) {

            if (commande.startsWith('echo')) {

                let arg = commande.split(' '[1]);
                let value = commande.split(' '[2]);
                console.log(arg)
                result = { type: "console_" + arg, value: value };
            }            

            else {
                return this.exec_commande()
            }

        } else {
            return this.exec_commande()
        }

    
        let typeParts = result.type.split('_');

        this.exec_commande(true, typeParts[0], typeParts[1], result.value);

    }

    async exec_commande( 
                valid = false, 
                type = "perso", 
                parm = null, 
                arg1 = null,
                arg2 = null, 
                exec = {} 
            ) {

        if (valid) {

            if (type == "perso") {

            }

            else if (type == "console") {

                if (parm == 'log') {
                    console.log(arg1)
                }
                else if (parm == 'warn') {
                    console.log(arg1)
                }
                else if (parm == 'error') {
                    console.log(arg1)
                }

            }

        }   

    }

}


export default cmd;
const fetch = require('node-fetch');

class SilverAuth {

    async login(mail, passwd) {
        try {
            const response = await fetch('https://auth.silvercore.fr/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mail,
                    passwd
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(`Erreur login: ${data.message.silver}`);
            }

            
            return data;
        } catch (err) {
            console.error("Erreur de login :", err.message);
            throw err;
        }
    }

    async verify(token) {
        try {
            const response = await fetch('https://auth.silvercore.fr/auth/verify', {
                headers: {
                    'Content-Type': 'application/json',
                    'silvertoken': token
                },
            });

            if (response.error) {
                throw new Error(`Erreur verify : ${response.message.silver}`);
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Erreur de vérification :", err.message);
            throw err;
        }
    }

    async register() {
        window.open('https://auth.silvercore.fr/auth/view/register?redirect=close', '_blank');
    };

}

export default new SilverAuth();

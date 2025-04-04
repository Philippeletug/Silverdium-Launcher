const fetch = require('node-fetch');

class SilverAuth {

    async login(mail, passwd) {
        try {
            const response = await fetch('https://auth.silverdium.fr/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mail,
                    passwd
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur login: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Erreur de login :", err.message);
            throw err;
        }
    }

    async verify() {
        try {
            const response = await fetch('https://auth.silverdium.fr/auth/verify');

            if (!response.ok) {
                throw new Error(`Erreur verify: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Erreur de vérification :", err.message);
            throw err;
        }
    }

    async register() {
        console.warn("⚠️ La méthode register() nécessite un navigateur pour ouvrir une nouvelle fenêtre.");
        console.warn("Utilise cette méthode côté front si tu veux ouvrir une page !");
    }

}

export default new SilverAuth();

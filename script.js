const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZG9zaHhjZGhuY25nZ3Zlbm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwNDQzMTIsImV4cCI6MjAzNjYyMDMxMn0.LOtfdIXCGzY4fWf7_zaboTC-iUHpdz_HKTJzybXG0b8";
const url = "https://prdoshxcdhncnggvennk.supabase.co";

const database = supabase.createClient(url, key);

const save = document.getElementById("save");


// Afficher les erreurs
function showError(elementId, message)
{
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 4000);
}


// Effacer les erreurs
function clearErros()
{
    document.querySelector("#libelleError").textContent = '';
    document.querySelector("#categorieError").textContent = '';
    document.querySelector("#messageError").textContent = '';
}


// Afficher les erreurs dynamiques
function showFromMessage(message, type)
{
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    setTimeout(() => {
        formMessage.textContent = '';
    }, 2000);
}

// La fonction de validation des erreurs
function validationForm(libelle, categorie, message)
{
    let isValid = true;

    // cette regex acceptera les chaînes de caractères qui contiennent des lettres, des accents, des chiffres et des espaces, avec une longueur comprise entre 3 et 100 caractères.
    const libelleRegex = /^[\p{L}\p{M}\p{N}\s]{3,100}$/u;

    // cette regex acceptera les chaînes de caractères qui contiennent des lettres, des accents, des chiffres et des espaces, avec une longueur comprise entre 3 et 255.
    const messageRegex = /^[\p{L}\p{M}\p{P}\p{N}\s]{3,255}$/u;

    // Les catégories valides
    const validCategories = ['politique', 'sport', 'sante', 'education']; 

    if (!libelleRegex.test(libelle)) {
        showError('libelleError', 'Le libellé doit contenir entre 3 et 100 chaînes de caractères.');
        isValid = false;
    }

    if (!validCategories.includes(categorie)) {
        showError('categorieError', 'Veuillez choisir une catégorie valide.');
        isValid = false;
    }

    if (!messageRegex.test(message)) {
        showError('messageError', 'Le message doit contenir entre 3 et 255 chaînes de caractères.');
        isValid = false;
    }

    return isValid;

}

// Ajouter une idée
save.addEventListener("click", async(e) => {
    e.preventDefault();

    let libelle = document.getElementById("libelle").value;
    let categorie = document.getElementById("categorie").value;
    let message = document.getElementById("message").value;
    let statut = null;

    clearErros();

    if (validationForm(libelle, categorie, message)) {
        try {
            const insertObject = {
                libelle,
                categorie,
                message,
                statut
            };
            const {data, error} = await database.from("idees").insert([insertObject]);
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout", error);
        }

        document.getElementById("ideaForm").reset();
        flashMessage = document.getElementById('flashmessage');

    } else {
        flashMessage.textContent = "Veuillez corriger les erreurs et réessayer";
        flashMessage.style.color = 'red';
        flashMessage.style.fontSize = '24px';
        flashMessage.style.textAlign = 'center';
        document.getElementById("ideaForm").style.display = 'none';
        setTimeout(() => {
            document.getElementById("ideaForm").style.display = 'block';
            flashMessage.textContent = '';
        }, 2000);
    }
})
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
        getIdeas();

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


// récuperer les données de la base de données
const getIdeas = async () => {
    try {
        const { data, error } = await database.from('idees').select('*');

        if (error) {
            throw error
        }
        console.log("Idées récupérées avec succès:", data);
        displayIdeas(data);

    } catch (error) {
         console.error("Erreur lors de la récupération des idées:", error.message);
    }
}


// l'interface pour l'affichage des idées
function displayIdeas(ideas) {
    const ideasContainer = document.getElementById("ideasContainer");
    ideasContainer.innerHTML = ""; // Clear previous content

    ideas.forEach((idea, index) => {
        // const truncatedMessage = idea.message.length > 255 ? `${idea.message.substr(0, 255)}...` : idea.message;

        if (index % 3 === 0) {
            const row = document.createElement("div");
            row.className = "row";
            ideasContainer.appendChild(row);
        }

        const row = ideasContainer.lastChild;

        const ideaCard = document.createElement("div");
        ideaCard.className = "col-md-4 col-sm-4 mb-5";

        const card = document.createElement("div");
        card.className = "card";

        if (idea.statut === true) {
            card.classList.add("approved");
        } else if (idea.statut === false) {
            card.classList.add("not-approved");
        }

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${idea.libelle}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${idea.categorie}</h6>
                <p class="card-text">${idea.message}</p>
                <div class="buttons">
                    ${idea.statut === null ? `
                        <button class="btn approve-btn" onclick="toggleApproval('${idea.id}', true)">
                            <img src="images/approved.svg" alt="Approuver">
                        </button>
                        <button class="btn disapprove-btn" onclick="toggleApproval('${idea.id}', false)">
                            <img src="images/not-approved.svg" alt="Désapprouver">
                        </button>
                    ` : ''}
                    <button class="btn delete-btn" onclick="deleteIdea('${idea.id}')">
                        <img src="images/trashs.svg" alt="Supprimer">
                    </button>
                </div>
            </div>
        `;

        ideaCard.appendChild(card);
        row.appendChild(ideaCard);
    });
}

// L'approbation des idées
async function toggleApproval(ideaId, approved) {
    try {
        const statut = approved;
        const { data, error } = await database
            .from('idees')
            .update({ statut })
            .eq('id', ideaId);

        if (error) {
            throw error;
        }

        console.log(`Idée ${ideaId} ${approved ? 'approuvée' : 'désapprouvée'} avec succès:`, data);
        getIdeas(); // Refresh the list of ideas after modification
    } catch (error) {
        console.error(`Erreur lors de l'${approved ? 'approbation' : 'désapprobation'} de l'idée ${ideaId}:`, error.message);
        alert(`Erreur lors de l'${approved ? 'approbation' : 'désapprobation'} de l'idée`);
    }
}

// Supprimer une idée
async function deleteIdea(ideaId) {
    try {
        const { data, error } = await database.from('idees').delete().eq('id', ideaId);

        if (error) {
            throw error;
        }

        console.log("Idée supprimée avec succès:", data);

        getIdeas(); // Refresh the list of ideas after deletion
    } catch (error) {
        console.error("Erreur lors de la suppression de l'idée:", error.message);
    }
}

document.addEventListener("DOMContentLoaded", getIdeas); // Initial call to fetch ideas on page load
//Sélection des éléments
const searchInput = document.getElementById("searchInput");
const recettesDiv = document.getElementById("recettes");
const modale = document.getElementById("modale");
const FermerModale = document.getElementById("FermerModale");
const mealName = document.getElementById("mealName");
const mealImg = document.getElementById("mealImg");
const ingredientsList = document.getElementById("ingredientsList");
const addListBtn = document.getElementById("addListBtn");
const shoppingList = document.getElementById("shoppingList");
const BtnVider = document.getElementById("BtnVider");

let currentIngredients = []; // ingrédients de la recette affichée dans la modale

//Recherche automatique (keyup)
searchInput.addEventListener("keyup", async function () {
	const motCle = searchInput.value.trim();

	if (motCle === "") {
		recettesDiv.innerHTML = "";
		return;
	}

	await chercherRecettes(motCle);
});

//Fonction pour chercher les recettes
async function chercherRecettes(motCle) {
	try {
		const reponse = await fetch(
			`https://www.themealdb.com/api/json/v1/1/search.php?s=${motCle}`
		);
		const data = await reponse.json();

		afficherRecettes(data.meals);
	} catch (erreur) {
		recettesDiv.innerHTML = "<p>Erreur lors de la recherche </p>";
	}
}

//Afficher les recettes sur la page
function afficherRecettes(recettes) {
	recettesDiv.innerHTML = "";

	if (!recettes) {
		recettesDiv.innerHTML = "<p>Aucune recette trouvée </p>";
		return;
	}

	recettes.forEach((recette) => {
		const carte = document.createElement("div");
		carte.className = "carte-recette";

		carte.innerHTML = `
            <img src="${recette.strMealThumb}" width="180">
            <h4>${recette.strMeal}</h4>
            <button onclick="voirIngredients('${recette.idMeal}')">Voir les ingrédients</button>
        `;

		recettesDiv.appendChild(carte);
	});
}

//Afficher les ingrédients dans la modale
async function voirIngredients(idRecette) {
	try {
		const reponse = await fetch(
			`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idRecette}`
		);
		const data = await reponse.json();
		const recette = data.meals[0];

		// Affichage modale
		mealName.textContent = recette.strMeal;
		mealImg.src = recette.strMealThumb;
		ingredientsList.innerHTML = "";
		currentIngredients = [];

		for (let i = 1; i <= 20; i++) {
			const ingr = recette[`strIngredient${i}`];
			const qt = recette[`strMeasure${i}`];

			if (ingr && ingr.trim() !== "") {
				const li = document.createElement("li");
				li.textContent = `${ingr} - ${qt}`;
				ingredientsList.appendChild(li);

				currentIngredients.push({ ingredient: ingr, quantite: qt });
			}
		}

		modale.style.display = "flex";

		// Sauvegarde dans localStorage
		localStorage.setItem("recette", JSON.stringify(recette));
		console.log(
			"Recette sauvegardée :",
			JSON.parse(localStorage.getItem("recette"))
		);
	} catch {
		alert("Erreur lors du chargement des ingrédients ");
	}
}

// Fermer modale
FermerModale.addEventListener("click", () => {
	modale.style.display = "none";
});

//Ajouter à la liste de courses
addListBtn.addEventListener("click", function () {
	let liste = JSON.parse(localStorage.getItem("listeCourses")) || [];

	currentIngredients.forEach((item) => {
		const existe = liste.some((i) => i.ingredient === item.ingredient);
		if (!existe) liste.push(item);
	});

	localStorage.setItem("listeCourses", JSON.stringify(liste));

	afficherListeCourses();
	modale.style.display = "none";
});

//Afficher la liste de courses
function afficherListeCourses() {
	shoppingList.innerHTML = "";
	const liste = JSON.parse(localStorage.getItem("listeCourses")) || [];

	liste.forEach((item, index) => {
		const li = document.createElement("li");
		li.textContent = `${item.ingredient} - ${item.quantite || ""}`;

		const suppr = document.createElement("button");
		suppr.textContent = "-";
		suppr.addEventListener("click", () => supprimerIngredient(index));

		li.appendChild(suppr);
		shoppingList.appendChild(li);
	});
}

// Supprimer un ingrédient
function supprimerIngredient(index) {
	let liste = JSON.parse(localStorage.getItem("listeCourses")) || [];
	liste.splice(index, 1);
	localStorage.setItem("listeCourses", JSON.stringify(liste));
	afficherListeCourses();
}

//  Vider la liste
BtnVider.addEventListener("click", () => {
	localStorage.removeItem("listeCourses");
	afficherListeCourses();
});

// Charger la liste au démarrage
afficherListeCourses();

// Variables globales
let questions = [];
let currentQuestionIndex = 0;
let phase = 'femme'; // Phase actuelle : 'femme' ou 'homme'
let userAnswersFemme = [];
let userAnswersHomme = [];

// Son sexy pour la transition
const sonOhYes = new Audio('sons/oh-yes.wav');

// Sons pour les boutons du questionnaire (style Candy Crush)
const sonsClick = [
  new Audio('sons/click1.wav'),
  new Audio('sons/click2.wav'),
  new Audio('sons/click3.wav')
];

/**
 * Joue un son de clic aléatoire pour les boutons du questionnaire
 */
function jouerSonClick() {
  const sonAleatoire = sonsClick[Math.floor(Math.random() * sonsClick.length)];
  sonAleatoire.currentTime = 0;
  sonAleatoire.play().catch(e => console.log('Son non disponible'));
}
/**
 * Affiche la page demandée et effectue des actions spécifiques selon la page
 * @param {string} id - id de la page à afficher
 */
function afficher(id) {
  // Si on va vers le menu depuis l'accueil, jouer le son et faire la transition
  if (id === "menu") {
    // Joue le son sexy
    sonOhYes.currentTime = 0;
    sonOhYes.play();
    
    // Transition slide avec animation
    const accueil = document.getElementById("accueil");
    const menu = document.getElementById("menu");
    
    // Prépare l'animation
    accueil.style.transform = "translateX(0%)";
    menu.style.display = "block";
    menu.style.transform = "translateX(100%)";
    
    // Lance l'animation après un petit délai
    setTimeout(() => {
      accueil.style.transform = "translateX(-100%)";
      menu.style.transform = "translateX(0%)";
    }, 150);
    
    // Cache l'accueil après l'animation
    setTimeout(() => {
      accueil.style.display = "none";
    }, 1200);
    
    return;
  }
  
  // Comportement normal pour les autres pages
  document.querySelectorAll(".page").forEach(div => {
    div.style.display = "none";
    div.style.transform = "translateX(0%)"; // Reset des transformations
  });
  document.getElementById(id).style.display = "block";

  if (id === "questionnaire") {
    // Applique la classe CSS selon la phase (rose pour femme, bleu pour homme)
    const questionnaireDiv = document.getElementById('questionnaire');
    if (phase === 'femme') {
      questionnaireDiv.classList.remove('homme');
      questionnaireDiv.classList.add('femme');
    } else {
      questionnaireDiv.classList.remove('femme');
      questionnaireDiv.classList.add('homme');
    }

    // Charge les questions du questionnaire
    chargerQuestions();
  }

  if (id === "resultat") {
    // Affiche la page des résultats
    afficherResultat();
  }
}


function afficherTitrePhase() {
  const titre = document.getElementById("titre-phase");
  if (phase === 'femme') {
    titre.textContent = "partenaire 1, c’est votre tour";
    titre.style.color = "#e91e63"; // rose
  } else {
    titre.textContent = "Partenaire 2, à vous de jouer";
    titre.style.color = "#2196f3"; // bleu
  }
}


/**
 * Charge les questions depuis le fichier JSON et initialise la phase en cours
 */
function chargerQuestions() {
  // Questions intégrées directement dans le code
  questions = [
    { "id": 1, "question": "Préférez-vous dominer ou être dominé ?", "options": ["Dominer", "Être dominé", "Les deux"] },
    { "id": 2, "question": "Quel type de préliminaires préférez-vous ?", "options": ["Oral", "Caresses", "Massages"] },
    { "id": 3, "question": "Quel est votre lieu préféré pour faire l'amour ?", "options": ["Lit", "Douche", "Endroit insolite"] },
    { "id": 4, "question": "Quelle fréquence vous convient le mieux ?", "options": ["Tous les jours", "2-3 fois/semaine", "Occasionnellement"] },
    { "id": 5, "question": "Quel est votre niveau de curiosité pour les jeux sexy ?", "options": ["Très curieux", "Un peu", "Pas du tout"] },
    { "id": 6, "question": "Aimez-vous les surprises coquines ?", "options": ["Oui, toujours", "Parfois", "Non, pas trop"] },
    { "id": 7, "question": "Quelle est votre position favorite ?", "options": ["Missionnaire", "Derrière", "Autre"] },
    { "id": 8, "question": "Avez-vous déjà utilisé des accessoires ?", "options": ["Oui souvent", "Parfois", "Jamais"] },
    { "id": 9, "question": "Que pensez-vous des jeux de rôle ?", "options": ["J’adore", "Curieux(se) d’essayer", "Pas mon truc"] },
    { "id": 10, "question": "Aimez-vous l’idée d’un lieu public ?", "options": ["Oui, excitant", "Seulement très discret", "Jamais"] },
    { "id": 11, "question": "Quelle intensité préférez-vous ?", "options": ["Douce", "Modérée", "Intense"] },
    { "id": 12, "question": "Vous sentez-vous à l’aise avec les jeux de domination ?", "options": ["Oui", "À essayer", "Non"] },
    { "id": 13, "question": "Jouez-vous avec des limites ?", "options": ["Oui, clairement définies", "Parfois", "Non"] },
    { "id": 14, "question": "Quelle durée préférez-vous pour un moment intime ?", "options": ["Long", "Moyen", "Court"] },
    { "id": 15, "question": "Jusqu’où êtes-vous prêt(e) à aller dans vos jeux intimes ?", "options": ["Très loin, sans tabou", "Dans certaines limites", "Plutôt soft"] }
  ];

  currentQuestionIndex = 0;
  if (phase === 'femme') {
    userAnswersFemme = [];
  } else {
    userAnswersHomme = [];
  }
  afficherQuestion();
}


/**
 * Affiche la question courante avec ses options de réponses
 */
function afficherQuestion() {
  afficherTitrePhase(); // Met à jour le titre selon la phase
  const container = document.getElementById("questions-container");
  const messageDiv = document.getElementById("message-transition");
  
  // Animation de sortie pour la question précédente
  container.classList.add('question-exit');
  
  setTimeout(() => {
    container.innerHTML = "";
    container.classList.remove('question-exit');
    container.classList.add('question-enter');
    
    // Contenu de la nouvelle question
    afficherContenuQuestion(container, messageDiv);
    
    // Animation d'entrée
    setTimeout(() => {
      container.classList.remove('question-enter');
      container.classList.add('question-enter-active');
    }, 50);
    
    setTimeout(() => {
      container.classList.remove('question-enter-active');
    }, 650);
    
  }, 300);
}

/**
 * Affiche le contenu de la question (séparé pour la gestion des animations)
 */
function afficherContenuQuestion(container, messageDiv) {
  if (messageDiv) messageDiv.innerHTML = "";

  // Si on a affiché toutes les questions de la phase en cours
  if (currentQuestionIndex >= questions.length) {
    if (phase === 'femme') {
      // Affiche un message avec bouton OK pour passer au partenaire suivant
      if (messageDiv) {
        messageDiv.innerHTML = `
          <p>Passe le téléphone au partenaire suivant !</p>
          <button id="btn-ok-partenaire">OK</button>
        `;
        // Au clic sur OK, on change la phase et on relance le questionnaire
        document.getElementById("btn-ok-partenaire").addEventListener("click", () => {
          phase = 'homme';
          currentQuestionIndex = 0;
          messageDiv.innerHTML = "";
          afficher('questionnaire'); // recharge la page questionnaire avec la nouvelle phase
          afficherQuestion(); // affiche la première question homme
        });
      }
    } else {
      // Fin du questionnaire homme, affichage du bouton résultat
      container.innerHTML = `<h3>Merci d'avoir répondu !</h3>
        <button onclick="afficher('resultat')">Voir la compatibilité</button>`;
    }
    return;
  }

  // Le reste du code pour afficher la question et les réponses
  const question = questions[currentQuestionIndex];
  const titre = document.createElement("h3");
  titre.textContent = question.question;
  container.appendChild(titre);

  question.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("reponse-btn");

    btn.onclick = () => {
      // Joue le son de clic style Candy Crush
      jouerSonClick();
      
      if (phase === 'femme') {
        userAnswersFemme.push({ questionId: question.id, answer: option });
      } else {
        userAnswersHomme.push({ questionId: question.id, answer: option });
      }
      
      // Délai pour laisser l'animation du bouton se terminer
      setTimeout(() => {
        currentQuestionIndex++;
        afficherQuestion();
      }, 200);
    };
    container.appendChild(btn);
  });
}


/**
 * Affiche la page des résultats avec la compatibilité et un tableau récapitulatif
 */
function afficherResultat() {
  const container = document.getElementById("resultat");
  container.innerHTML = "<h2>Compatibilité du couple</h2>";

  let nbQuestions = questions.length;
  let nbMatches = 0;

  // Compte le nombre de réponses identiques entre Madame et Monsieur
  for (let i = 0; i < nbQuestions; i++) {
    if (userAnswersFemme[i] && userAnswersHomme[i] &&
        userAnswersFemme[i].answer === userAnswersHomme[i].answer) {
      nbMatches++;
    }
  }

  // Calcul du pourcentage de compatibilité
  const pourcentage = Math.round((nbMatches / nbQuestions) * 100);

  container.innerHTML += `<p>Votre compatibilité est de <strong>${pourcentage}%</strong>.</p>`;

  // Construction du tableau récapitulatif des réponses
  let table = `<table border="1" cellpadding="5" cellspacing="0">
  <tr><th>Question</th><th>Réponse Madame</th><th>Réponse Monsieur</th></tr>`;

  for (let i = 0; i < nbQuestions; i++) {
    const q = questions[i];
    const repF = userAnswersFemme[i] ? userAnswersFemme[i].answer : "-";
    const repH = userAnswersHomme[i] ? userAnswersHomme[i].answer : "-";
    const rowClass = (repF === repH) ? 'match' : 'mismatch';

    table += `<tr class="${rowClass}">
              <td>${q.question}</td>
              <td>${repF}</td>
              <td>${repH}</td>
            </tr>`;
  }
  table += "</table>";

  container.innerHTML += table;

  container.innerHTML += `<button onclick="resetQuestionnaire(); afficher('menu')">Retour au menu</button>`;
}

function resetQuestionnaire() {
  // Réinitialise les réponses et la phase
  userAnswersFemme = [];
  userAnswersHomme = [];
  currentQuestionIndex = 0;
  phase = 'femme';

  // Vide le contenu des conteneurs
  document.getElementById("questions-container").innerHTML = "";
  document.getElementById("questionnaire").className = "";

  // Supprime le message "à vous de jouer" s’il existe
  const titrePhase = document.getElementById("titre-phase");
  if (titrePhase) {
    titrePhase.remove();
  }
}

// Roue - roulette

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const segments = ["Soft", "Coquin", "Hard"];
const colors = ["#FFB6C1", "#FF69B4", "#C71585"];
const centerX = 250, centerY = 250, outsideR = 240, insideR = 80;
let currentAngle = 0;

// Sons
const sons = {
  "Soft": new Audio('sons/soft.wav'),
  "Coquin": new Audio('sons/coquin.wav'),
  "Hard": new Audio('sons/hard.wav')
};

let categoriePrecedente = null;

function jouerSonCategorie(categorie) {
  const son = sons[categorie];
  if (son) {
    son.currentTime = 0; // Remet le son au début
    son.play();
  }
}


function drawWheel() {
  const arc = 2 * Math.PI / segments.length;

  for (let i = 0; i < segments.length; i++) {
    const angle = currentAngle + i * arc;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(centerX, centerY, outsideR, angle, angle + arc);
    ctx.arc(centerX, centerY, insideR, angle + arc, angle, true);
    ctx.fill();

    // Texte
    ctx.save();
    ctx.translate(
      centerX + Math.cos(angle + arc / 2) * (outsideR + insideR) / 2,
      centerY + Math.sin(angle + arc / 2) * (outsideR + insideR) / 2
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(segments[i], 0, 0);
    ctx.restore();
  }

  // Flèche
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY - outsideR - 10);
  ctx.lineTo(centerX + 10, centerY - outsideR - 10);
  ctx.lineTo(centerX, centerY - outsideR + 20);
  ctx.closePath();
  ctx.fill();
}

function easeOut(t) {
  return t * (2 - t);
}

function rotateWheel() {
  const startAngle = currentAngle;
  const spins = 6 + Math.random() * 3;
  const targetAngle = startAngle + spins * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const duration = 4000;
  let startTime = null;

  function animate(time) {
  if (!startTime) startTime = time;
  const elapsed = time - startTime;
  if (elapsed < duration) {
    const t = elapsed / duration;
    const eased = easeOut(t);
    currentAngle = startAngle + (targetAngle - startAngle) * eased;
    drawFrame();

    const arc = 2 * Math.PI / segments.length;
    const offsetAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI);
    let selectedIndex = Math.floor((segments.length - (offsetAngle / arc)) % segments.length);
    if (selectedIndex < 0) selectedIndex += segments.length;
    const categorieActuelle = segments[selectedIndex];

    if (categorieActuelle !== categoriePrecedente) {
      jouerSonCategorie(categorieActuelle); // ➤ son dynamique pendant la rotation
      categoriePrecedente = categorieActuelle;
    }

    requestAnimationFrame(animate);
  } else {
    currentAngle = targetAngle % (2 * Math.PI);
    drawFrame();

    const arc = 2 * Math.PI / segments.length;
    const offsetAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI);
    let selectedIndex = Math.floor((segments.length - (offsetAngle / arc)) % segments.length);
    if (selectedIndex < 0) selectedIndex += segments.length;
    const niveau = segments[selectedIndex];
    const defis = challenges[niveau];
    const defiAleatoire = defis[Math.floor(Math.random() * defis.length)];

    const resultatDiv = document.getElementById("roulette-resultat");
    resultatDiv.innerHTML = `
      <strong>🎯 Niveau :</strong> ${niveau}<br>
      <strong>💋 Défi :</strong> ${defiAleatoire}
    `;

    // ✅ Joue le son final ici, une seule fois
    sons[niveau].play();

    categoriePrecedente = null;
  }
}

requestAnimationFrame(animate);
}

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWheel();
}

// Défis par catégorie
const challenges = {
  "Soft": [
    "Un baiser passionné pendant 30 secondes",
    "Un massage doux et relaxant",
    "Regarder votre partenaire dans les yeux pendant une minute",
    "Un compliment sincère à votre moitié",
    "Un câlin chaleureux de 2 minutes"
  ],
  "Coquin": [
    "Un strip-tease improvisé",
    "Chuchoter un fantasme à l’oreille",
    "Un massage des pieds coquin",
    "Un jeu de rôle rapide",
    "Un baiser dans le cou"
  ],
  "Hard": [
    "Un défi BDSM léger (ex : menottes en tissu)",
    "Utiliser un accessoire surprise",
    "Un défi pimenté à l’aveugle",
    "Un jeu de domination doux",
    "Un moment intense avec respiration contrôlée"
  ]
};

// Event listener pour le bouton roulette
document.addEventListener('DOMContentLoaded', function () {
  const spinButton = document.getElementById('spin');
  if (spinButton) {
    spinButton.addEventListener('click', () => {
      rotateWheel();
    });
  }
});

// Initialisation du canvas
drawWheel();

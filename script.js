// =================== VARIABLES GLOBALES ===================
let questions = [];
let currentQuestionIndex = 0;
let phase = 'femme'; // Phase actuelle : 'femme' ou 'homme'
let userAnswersFemme = [];
let userAnswersHomme = [];

// =================== GESTION AUDIO ===================
const audio = {
  ohYes: new Audio('sons/oh-yes.wav'),
  clicks: [
    new Audio('sons/click1.wav'),
    new Audio('sons/click2.wav'),
    new Audio('sons/click3.wav'),
    new Audio('sons/click4.wav'),
    new Audio('sons/click5.wav')
  ]
};

/**
 * Joue un son de clic aléatoire pour les boutons du questionnaire
 */
function jouerSonClick() {
  const sonAleatoire = audio.clicks[Math.floor(Math.random() * audio.clicks.length)];
  sonAleatoire.currentTime = 0;
  sonAleatoire.play().catch(e => console.log('Son non disponible:', e));
}

/**
 * Joue le son "oh yes" sexy
 */
function jouerSonOhYes() {
  audio.ohYes.currentTime = 0;
  audio.ohYes.play().catch(e => console.log('Son non disponible:', e));
}

// =================== NAVIGATION ENTRE PAGES ===================
/**
 * Affiche la page demandée avec transitions appropriées
 * @param {string} pageId - ID de la page à afficher
 */
function afficher(pageId) {
  switch (pageId) {
    case 'menu':
      transitionAccueilVersMenu();
      break;
    case 'questionnaire':
      afficherPageQuestionnaire();
      break;
    case 'resultat':
      afficherPageResultat();
      break;
    default:
      afficherPageStandard(pageId);
  }
}

/**
 * Transition spéciale de l'accueil vers le menu avec son et slide
 */
function transitionAccueilVersMenu() {
  jouerSonOhYes();
  
  const accueil = document.getElementById("accueil");
  const menu = document.getElementById("menu");
  
  // Prépare l'animation
  accueil.style.transform = "translateX(0%)";
  menu.style.display = "block";
  menu.style.transform = "translateX(100%)";
  
  // Lance l'animation
  setTimeout(() => {
    accueil.style.transform = "translateX(-100%)";
    menu.style.transform = "translateX(0%)";
  }, 150);
  
  // Cache l'accueil après l'animation
  setTimeout(() => {
    accueil.style.display = "none";
  }, 1200);
}

/**
 * Affiche la page questionnaire avec configuration appropriée
 */
async function afficherPageQuestionnaire() {
  masquerToutesLesPages();
  document.getElementById('questionnaire').style.display = "block";
  
  // Configure la classe CSS selon la phase
  const questionnaireDiv = document.getElementById('questionnaire');
  questionnaireDiv.className = phase; // 'femme' ou 'homme'
  
  await chargerQuestions();
}

/**
 * Affiche la page des résultats
 */
function afficherPageResultat() {
  masquerToutesLesPages();
  document.getElementById('resultat').style.display = "block";
  genererResultats();
}

/**
 * Affichage standard pour les autres pages
 */
function afficherPageStandard(pageId) {
  masquerToutesLesPages();
  document.getElementById(pageId).style.display = "block";
}

/**
 * Masque toutes les pages et reset les transformations
 */
function masquerToutesLesPages() {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
    page.style.transform = "translateX(0%)";
  });
}

// =================== GESTION DU QUESTIONNAIRE ===================
/**
 * Charge et initialise les questions du questionnaire
 */
async function chargerQuestions() {
  try {
    const response = await fetch('data/questions.json');
    questions = await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement des questions:', error);
    // Questions de fallback en cas d'erreur
    questions = [
      { "id": 1, "question": "Préférez-vous dominer ou être dominé ?", "options": ["Dominer", "Être dominé", "Les deux"] },
      { "id": 2, "question": "Quel type de préliminaires préférez-vous ?", "options": ["Oral", "Caresses", "Massages"] }
    ];
  }

  currentQuestionIndex = 0;
  if (phase === 'femme') {
    userAnswersFemme = [];
  } else {
    userAnswersHomme = [];
  }
  
  afficherQuestion();
}

/**
 * Met à jour le titre selon la phase actuelle
 */
function mettreAJourTitrePhase() {
  const titre = document.getElementById("titre-phase");
  if (phase === 'femme') {
    titre.textContent = "Partenaire 1, c'est votre tour";
    titre.style.color = "#e91e63";
  } else {
    titre.textContent = "Partenaire 2, à vous de jouer";
    titre.style.color = "#2196f3";
  }
}

/**
 * Affiche la question courante avec animation de transition
 */
function afficherQuestion() {
  mettreAJourTitrePhase();
  
  const container = document.getElementById("questions-container");
  const messageDiv = document.getElementById("message-transition");
  
  // Animation de sortie
  container.classList.add('question-exit');
  
  setTimeout(() => {
    container.innerHTML = "";
    container.classList.remove('question-exit');
    container.classList.add('question-enter');
    
    genererContenuQuestion(container, messageDiv);
    
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
 * Génère le contenu HTML de la question courante
 */
function genererContenuQuestion(container, messageDiv) {
  if (messageDiv) messageDiv.innerHTML = "";

  // Vérification fin de phase
  if (currentQuestionIndex >= questions.length) {
    gererFinDePhase(container, messageDiv);
    return;
  }

  // Affichage de la question et des options
  const question = questions[currentQuestionIndex];
  
  const titre = document.createElement("h3");
  titre.textContent = question.question;
  container.appendChild(titre);

  question.options.forEach(option => {
    const bouton = creerBoutonReponse(option, question);
    container.appendChild(bouton);
  });
}

/**
 * Crée un bouton de réponse avec les événements appropriés
 */
function creerBoutonReponse(option, question) {
  const bouton = document.createElement("button");
  bouton.textContent = option;
  bouton.classList.add("reponse-btn");

  bouton.onclick = () => {
    jouerSonClick(); // Un seul son par clic
    enregistrerReponse(question.id, option);
    
    // Délai pour l'animation du bouton
    setTimeout(() => {
      currentQuestionIndex++;
      afficherQuestion();
    }, 200);
  };

  return bouton;
}

/**
 * Enregistre la réponse selon la phase actuelle
 */
function enregistrerReponse(questionId, reponse) {
  if (phase === 'femme') {
    userAnswersFemme.push({ questionId, answer: reponse });
  } else {
    userAnswersHomme.push({ questionId, answer: reponse });
  }
}

/**
 * Gère la fin d'une phase (femme ou homme)
 */
function gererFinDePhase(container, messageDiv) {
  if (phase === 'femme') {
    afficherTransitionVersHomme(messageDiv);
  } else {
    afficherFinQuestionnaire(container);
  }
}

/**
 * Affiche le message de transition vers la phase homme
 */
function afficherTransitionVersHomme(messageDiv) {
  if (messageDiv) {
    messageDiv.innerHTML = `
      <p>Passe le téléphone au partenaire suivant !</p>
      <button id="btn-ok-partenaire">OK</button>
    `;
    
    document.getElementById("btn-ok-partenaire").addEventListener("click", () => {
      phase = 'homme';
      currentQuestionIndex = 0;
      messageDiv.innerHTML = "";
      afficher('questionnaire');
    });
  }
}

/**
 * Affiche la fin du questionnaire avec bouton résultats
 */
function afficherFinQuestionnaire(container) {
  container.innerHTML = `
    <h3>Merci d'avoir répondu !</h3>
    <button onclick="afficher('resultat')">Voir la compatibilité</button>
  `;
}

// =================== GESTION DES RÉSULTATS ===================
/**
 * Génère et affiche les résultats de compatibilité
 */
function genererResultats() {
  const container = document.getElementById("resultat");
  container.innerHTML = "<h2>Compatibilité du couple</h2>";

  const { nbMatches, pourcentage } = calculerCompatibilite();
  
  container.innerHTML += `<p>Votre compatibilité est de <strong>${pourcentage}%</strong>.</p>`;
  container.innerHTML += genererTableauResultats();
  container.innerHTML += `<button onclick="reinitialiserQuestionnaire(); afficher('menu')">Retour au menu</button>`;
}

/**
 * Calcule le pourcentage de compatibilité
 */
function calculerCompatibilite() {
  const nbQuestions = questions.length;
  let nbMatches = 0;

  for (let i = 0; i < nbQuestions; i++) {
    if (userAnswersFemme[i] && userAnswersHomme[i] &&
        userAnswersFemme[i].answer === userAnswersHomme[i].answer) {
      nbMatches++;
    }
  }

  const pourcentage = Math.round((nbMatches / nbQuestions) * 100);
  return { nbMatches, pourcentage };
}

/**
 * Génère le tableau HTML des résultats
 */
function genererTableauResultats() {
  let tableau = `<div class="tableau-container">
    <table class="tableau-mobile">
      <thead>
        <tr>
          <th>Question</th>
          <th>Partenaire 1</th>
          <th>Partenaire 2</th>
        </tr>
      </thead>
      <tbody>`;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const reponseF = userAnswersFemme[i] ? userAnswersFemme[i].answer : "-";
    const reponseH = userAnswersHomme[i] ? userAnswersHomme[i].answer : "-";
    const classeCSS = (reponseF === reponseH) ? 'match' : 'mismatch';

    tableau += `
        <tr class="${classeCSS}">
          <td class="question-cell">${question.question}</td>
          <td class="reponse-cell">${reponseF}</td>
          <td class="reponse-cell">${reponseH}</td>
        </tr>`;
  }
  
  tableau += `
      </tbody>
    </table>
  </div>`;
  return tableau;
}

/**
 * Remet à zéro le questionnaire
 */
function reinitialiserQuestionnaire() {
  userAnswersFemme = [];
  userAnswersHomme = [];
  currentQuestionIndex = 0;
  phase = 'femme';

  document.getElementById("questions-container").innerHTML = "";
  document.getElementById("questionnaire").className = "";
  
  // Nettoie aussi la page de résultat
  const resultatContainer = document.getElementById("resultat");
  if (resultatContainer) {
    resultatContainer.innerHTML = "";
  }
}

// =================== ROULETTE SEXY ===================
const roulette = {
  canvas: null,
  ctx: null,
  segments: [],
  colors: [],
  centerX: 250,
  centerY: 250,
  outsideR: 240,
  insideR: 80,
  currentAngle: 0,
  categoriePrecedente: null,
  challenges: {},
  
  sons: {
    "Soft": new Audio('sons/soft.wav'),
    "Coquin": new Audio('sons/coquin.wav'),
    "Hard": new Audio('sons/hard.wav')
  }
};

/**
 * Initialise la roulette
 */
async function initialiserRoulette() {
  // Charge les données de la roulette
  await chargerDonneesRoulette();
  
  roulette.canvas = document.getElementById('wheel');
  if (!roulette.canvas) return;
  
  roulette.ctx = roulette.canvas.getContext('2d');
  dessinerRoue();
  
  const boutonSpin = document.getElementById('spin');
  if (boutonSpin) {
    boutonSpin.addEventListener('click', () => {
      tournerRoue();
    });
  }
}

/**
 * Charge les données de la roulette depuis le JSON
 */
async function chargerDonneesRoulette() {
  try {
    const response = await fetch('data/roulette.json');
    const data = await response.json();
    roulette.segments = data.segments;
    roulette.colors = data.colors;
    roulette.challenges = data.challenges;
  } catch (error) {
    console.error('Erreur lors du chargement des données roulette:', error);
    // Données de fallback
    roulette.segments = ["Soft", "Coquin", "Hard"];
    roulette.colors = ["#FFB6C1", "#FF69B4", "#C71585"];
    roulette.challenges = {
      "Soft": ["Un baiser passionné pendant 30 secondes"],
      "Coquin": ["Un strip-tease improvisé"],
      "Hard": ["Un défi BDSM léger"]
    };
  }
}

/**
 * Dessine la roue sur le canvas
 */
function dessinerRoue() {
  const arc = 2 * Math.PI / roulette.segments.length;

  for (let i = 0; i < roulette.segments.length; i++) {
    const angle = roulette.currentAngle + i * arc;
    roulette.ctx.fillStyle = roulette.colors[i];
    roulette.ctx.beginPath();
    roulette.ctx.arc(roulette.centerX, roulette.centerY, roulette.outsideR, angle, angle + arc);
    roulette.ctx.arc(roulette.centerX, roulette.centerY, roulette.insideR, angle + arc, angle, true);
    roulette.ctx.fill();

    // Texte
    roulette.ctx.save();
    roulette.ctx.translate(
      roulette.centerX + Math.cos(angle + arc / 2) * (roulette.outsideR + roulette.insideR) / 2,
      roulette.centerY + Math.sin(angle + arc / 2) * (roulette.outsideR + roulette.insideR) / 2
    );
    roulette.ctx.rotate(angle + arc / 2 + Math.PI / 2);
    roulette.ctx.fillStyle = '#fff';
    roulette.ctx.font = 'bold 18px sans-serif';
    roulette.ctx.textAlign = 'center';
    roulette.ctx.fillText(roulette.segments[i], 0, 0);
    roulette.ctx.restore();
  }

  // Flèche
  roulette.ctx.fillStyle = '#444';
  roulette.ctx.beginPath();
  roulette.ctx.moveTo(roulette.centerX - 10, roulette.centerY - roulette.outsideR - 10);
  roulette.ctx.lineTo(roulette.centerX + 10, roulette.centerY - roulette.outsideR - 10);
  roulette.ctx.lineTo(roulette.centerX, roulette.centerY - roulette.outsideR + 20);
  roulette.ctx.closePath();
  roulette.ctx.fill();
}

/**
 * Animation de rotation de la roue
 */
function tournerRoue() {
  const startAngle = roulette.currentAngle;
  const spins = 6 + Math.random() * 3;
  const targetAngle = startAngle + spins * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const duration = 4000;
  let startTime = null;

  function animer(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    
    if (elapsed < duration) {
      const t = elapsed / duration;
      const eased = easeOut(t);
      roulette.currentAngle = startAngle + (targetAngle - startAngle) * eased;
      dessinerFrame();

      // Son pendant la rotation
      const categorieActuelle = obtenirCategorieActuelle();
      if (categorieActuelle !== roulette.categoriePrecedente) {
        jouerSonCategorie(categorieActuelle);
        roulette.categoriePrecedente = categorieActuelle;
      }

      requestAnimationFrame(animer);
    } else {
      // Fin de rotation
      roulette.currentAngle = targetAngle % (2 * Math.PI);
      dessinerFrame();
      afficherResultatRoulette();
      roulette.categoriePrecedente = null;
    }
  }

  requestAnimationFrame(animer);
}

/**
 * Fonction d'easing pour l'animation
 */
function easeOut(t) {
  return t * (2 - t);
}

/**
 * Obtient la catégorie actuellement sélectionnée
 */
function obtenirCategorieActuelle() {
  const arc = 2 * Math.PI / roulette.segments.length;
  const offsetAngle = (roulette.currentAngle + Math.PI / 2) % (2 * Math.PI);
  let selectedIndex = Math.floor((roulette.segments.length - (offsetAngle / arc)) % roulette.segments.length);
  if (selectedIndex < 0) selectedIndex += roulette.segments.length;
  return roulette.segments[selectedIndex];
}

/**
 * Joue le son de la catégorie
 */
function jouerSonCategorie(categorie) {
  const son = roulette.sons[categorie];
  if (son) {
    son.currentTime = 0;
    son.play().catch(e => console.log('Son non disponible:', e));
  }
}

/**
 * Affiche le résultat final de la roulette
 */
function afficherResultatRoulette() {
  const niveau = obtenirCategorieActuelle();
  const defis = roulette.challenges[niveau];
  const defiAleatoire = defis[Math.floor(Math.random() * defis.length)];

  const resultatDiv = document.getElementById("roulette-resultat");
  
  // Animation feu d'artifice
  resultatDiv.classList.add('fireworks-animation');
  
  setTimeout(() => {
    resultatDiv.innerHTML = `
      <div class="defi-content">
        <strong>🎯 Niveau :</strong> ${niveau}<br>
        <strong>💋 Défi :</strong> ${defiAleatoire}
        <button onclick="afficher('menu')" class="retour-menu-btn">Retour au menu</button>
      </div>
    `;
    resultatDiv.classList.remove('fireworks-animation');
  }, 1000);

  // Son final
  jouerSonCategorie(niveau);
}

/**
 * Redessine le frame de la roulette
 */
function dessinerFrame() {
  roulette.ctx.clearRect(0, 0, roulette.canvas.width, roulette.canvas.height);
  dessinerRoue();
}

// =================== INITIALISATION ===================
document.addEventListener('DOMContentLoaded', function() {
  initialiserRoulette();
  initialiserMiniJeux();
});

// =================== MINI JEUX ===================
const miniJeux = {
  demineur: {
    grille: [],
    taille: 8,
    mines: 10,
    revele: 0,
    gameOver: false,
    firstClick: true
  },
  candyCrush: {
    grille: [],
    taille: 8,
    score: 0,
    selectedCandy: null,
    candyTypes: ['💋', '💄', '👠', '🌹', '💎', '🔥']
  },
  ticTacToe: {
    grille: Array(9).fill(''),
    joueurActuel: '💋',
    gameOver: false
  }
};

/**
 * Initialise les mini-jeux
 */
function initialiserMiniJeux() {
  // Les jeux seront initialisés quand on accède à leur page
}

/**
 * Affiche la page mini-jeux
 */
function afficherMiniJeux() {
  masquerToutesLesPages();
  document.getElementById('mini-jeux').style.display = "block";
}

/**
 * Lance un mini-jeu spécifique
 */
function lancerMiniJeu(jeu) {
  masquerToutesLesPages();
  document.getElementById(`jeu-${jeu}`).style.display = "block";
  
  switch(jeu) {
    case 'demineur':
      initialiserDemineur();
      break;
    case 'candy':
      initialiserCandyCrush();
      break;
    case 'tictactoe':
      initialiserTicTacToe();
      break;
  }
}

// =================== DÉMINEUR SEXY ===================
function initialiserDemineur() {
  const jeu = miniJeux.demineur;
  jeu.grille = [];
  jeu.revele = 0;
  jeu.gameOver = false;
  jeu.firstClick = true;
  
  // Crée la grille
  for (let i = 0; i < jeu.taille * jeu.taille; i++) {
    jeu.grille.push({
      mine: false,
      revele: false,
      flag: false,
      adjacent: 0
    });
  }
  
  afficherGrilleDemineur();
}

function placerMines(premierClick) {
  const jeu = miniJeux.demineur;
  let minesPlacees = 0;
  
  while (minesPlacees < jeu.mines) {
    const index = Math.floor(Math.random() * jeu.grille.length);
    if (!jeu.grille[index].mine && index !== premierClick) {
      jeu.grille[index].mine = true;
      minesPlacees++;
    }
  }
  
  // Calcule les nombres adjacents
  for (let i = 0; i < jeu.grille.length; i++) {
    if (!jeu.grille[i].mine) {
      jeu.grille[i].adjacent = compterMinesAdjacentes(i);
    }
  }
}

function compterMinesAdjacentes(index) {
  const jeu = miniJeux.demineur;
  const row = Math.floor(index / jeu.taille);
  const col = index % jeu.taille;
  let count = 0;
  
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const newRow = row + r;
      const newCol = col + c;
      if (newRow >= 0 && newRow < jeu.taille && newCol >= 0 && newCol < jeu.taille) {
        const newIndex = newRow * jeu.taille + newCol;
        if (jeu.grille[newIndex].mine) count++;
      }
    }
  }
  return count;
}

function afficherGrilleDemineur() {
  const container = document.getElementById('demineur-grille');
  container.innerHTML = '';
  
  miniJeux.demineur.grille.forEach((cellule, index) => {
    const div = document.createElement('div');
    div.className = 'demineur-cell';
    div.onclick = () => revelerCellule(index);
    div.oncontextmenu = (e) => {
      e.preventDefault();
      toggleFlag(index);
    };
    
    if (cellule.revele) {
      div.classList.add('revealed');
      if (cellule.mine) {
        div.textContent = '💣';
        div.classList.add('mine');
      } else if (cellule.adjacent > 0) {
        div.textContent = cellule.adjacent;
      }
    } else if (cellule.flag) {
      div.textContent = '🚩';
      div.classList.add('flagged');
    }
    
    container.appendChild(div);
  });
}

function revelerCellule(index) {
  const jeu = miniJeux.demineur;
  if (jeu.gameOver || jeu.grille[index].revele || jeu.grille[index].flag) return;
  
  if (jeu.firstClick) {
    placerMines(index);
    jeu.firstClick = false;
  }
  
  jeu.grille[index].revele = true;
  jeu.revele++;
  
  if (jeu.grille[index].mine) {
    jeu.gameOver = true;
    afficherMessage('💥 Boom! Vous avez touché une bombe sexy!');
  } else if (jeu.revele === jeu.grille.length - jeu.mines) {
    jeu.gameOver = true;
    afficherMessage('🎉 Victoire! Vous êtes un expert du démineur sexy!');
  }
  
  // Auto-révélation des cellules vides
  if (jeu.grille[index].adjacent === 0 && !jeu.grille[index].mine) {
    revelerCellulesAdjacentes(index);
  }
  
  afficherGrilleDemineur();
}

function revelerCellulesAdjacentes(index) {
  const jeu = miniJeux.demineur;
  const row = Math.floor(index / jeu.taille);
  const col = index % jeu.taille;
  
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const newRow = row + r;
      const newCol = col + c;
      if (newRow >= 0 && newRow < jeu.taille && newCol >= 0 && newCol < jeu.taille) {
        const newIndex = newRow * jeu.taille + newCol;
        if (!jeu.grille[newIndex].revele && !jeu.grille[newIndex].flag) {
          revelerCellule(newIndex);
        }
      }
    }
  }
}

function toggleFlag(index) {
  const jeu = miniJeux.demineur;
  if (jeu.gameOver || jeu.grille[index].revele) return;
  
  jeu.grille[index].flag = !jeu.grille[index].flag;
  afficherGrilleDemineur();
}

// =================== CANDY CRUSH SEXY ===================
function initialiserCandyCrush() {
  const jeu = miniJeux.candyCrush;
  jeu.grille = [];
  jeu.score = 0;
  jeu.selectedCandy = null;
  
  // Crée la grille
  for (let i = 0; i < jeu.taille * jeu.taille; i++) {
    jeu.grille.push(jeu.candyTypes[Math.floor(Math.random() * jeu.candyTypes.length)]);
  }
  
  afficherGrilleCandy();
  document.getElementById('candy-score').textContent = jeu.score;
}

function afficherGrilleCandy() {
  const container = document.getElementById('candy-grille');
  container.innerHTML = '';
  
  miniJeux.candyCrush.grille.forEach((candy, index) => {
    const div = document.createElement('div');
    div.className = 'candy-cell';
    div.textContent = candy;
    div.onclick = () => selectionnerCandy(index);
    
    if (miniJeux.candyCrush.selectedCandy === index) {
      div.classList.add('selected');
    }
    
    container.appendChild(div);
  });
}

function selectionnerCandy(index) {
  const jeu = miniJeux.candyCrush;
  
  if (jeu.selectedCandy === null) {
    jeu.selectedCandy = index;
  } else if (jeu.selectedCandy === index) {
    jeu.selectedCandy = null;
  } else {
    // Vérifie si les candies sont adjacents
    if (sontAdjacents(jeu.selectedCandy, index)) {
      echangerCandies(jeu.selectedCandy, index);
    }
    jeu.selectedCandy = null;
  }
  
  afficherGrilleCandy();
}

function sontAdjacents(index1, index2) {
  const taille = miniJeux.candyCrush.taille;
  const row1 = Math.floor(index1 / taille);
  const col1 = index1 % taille;
  const row2 = Math.floor(index2 / taille);
  const col2 = index2 % taille;
  
  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

function echangerCandies(index1, index2) {
  const jeu = miniJeux.candyCrush;
  const temp = jeu.grille[index1];
  jeu.grille[index1] = jeu.grille[index2];
  jeu.grille[index2] = temp;
  
  // Vérifie les matches
  const matches = trouverMatches();
  if (matches.length > 0) {
    supprimerMatches(matches);
    jeu.score += matches.length * 10;
    document.getElementById('candy-score').textContent = jeu.score;
    jouerSonClick();
  } else {
    // Annule l'échange si pas de match
    jeu.grille[index2] = jeu.grille[index1];
    jeu.grille[index1] = temp;
  }
}

function trouverMatches() {
  const jeu = miniJeux.candyCrush;
  const matches = [];
  
  // Vérifie les lignes
  for (let row = 0; row < jeu.taille; row++) {
    let count = 1;
    for (let col = 1; col < jeu.taille; col++) {
      const current = row * jeu.taille + col;
      const previous = row * jeu.taille + (col - 1);
      
      if (jeu.grille[current] === jeu.grille[previous]) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            matches.push(row * jeu.taille + (col - 1 - i));
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let i = 0; i < count; i++) {
        matches.push(row * jeu.taille + (jeu.taille - 1 - i));
      }
    }
  }
  
  return [...new Set(matches)];
}

function supprimerMatches(matches) {
  const jeu = miniJeux.candyCrush;
  matches.forEach(index => {
    jeu.grille[index] = jeu.candyTypes[Math.floor(Math.random() * jeu.candyTypes.length)];
  });
  
  setTimeout(() => {
    afficherGrilleCandy();
  }, 300);
}

// =================== TIC-TAC-TOE SEXY ===================
function initialiserTicTacToe() {
  const jeu = miniJeux.ticTacToe;
  jeu.grille = Array(9).fill('');
  jeu.joueurActuel = '💋';
  jeu.gameOver = false;
  
  afficherGrilleTicTacToe();
  document.getElementById('tictactoe-joueur').textContent = jeu.joueurActuel;
}

function afficherGrilleTicTacToe() {
  const container = document.getElementById('tictactoe-grille');
  container.innerHTML = '';
  
  miniJeux.ticTacToe.grille.forEach((cellule, index) => {
    const div = document.createElement('div');
    div.className = 'tictactoe-cell';
    div.textContent = cellule;
    div.onclick = () => jouerTicTacToe(index);
    container.appendChild(div);
  });
}

function jouerTicTacToe(index) {
  const jeu = miniJeux.ticTacToe;
  
  if (jeu.gameOver || jeu.grille[index] !== '') return;
  
  jeu.grille[index] = jeu.joueurActuel;
  jouerSonClick();
  
  if (verifierVictoire()) {
    jeu.gameOver = true;
    afficherMessage(`🎉 ${jeu.joueurActuel} a gagné!`);
  } else if (jeu.grille.every(cell => cell !== '')) {
    jeu.gameOver = true;
    afficherMessage('🤝 Match nul!');
  } else {
    jeu.joueurActuel = jeu.joueurActuel === '💋' ? '🔥' : '💋';
    document.getElementById('tictactoe-joueur').textContent = jeu.joueurActuel;
  }
  
  afficherGrilleTicTacToe();
}

function verifierVictoire() {
  const grille = miniJeux.ticTacToe.grille;
  const lignesGagnantes = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
    [0, 4, 8], [2, 4, 6] // diagonales
  ];
  
  return lignesGagnantes.some(ligne => {
    const [a, b, c] = ligne;
    return grille[a] && grille[a] === grille[b] && grille[a] === grille[c];
  });
}

function afficherMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'game-message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 3000);
});
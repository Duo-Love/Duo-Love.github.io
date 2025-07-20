// script.js amélioré avec toutes les nouvelles fonctionnalités

let phase = "femme";
let index = 0;
let reponsesFemme = [];
let reponsesHomme = [];
let questions = [];
let rouletteData = {};
let rouletteGages = [];

// Variables pour les mini-jeux
let deminerGrid = [];
let deminerSize = 8;
let deminerMines = 10;
let candyGrid = [];
let candySize = 8;
let candyScore = 0;
let candySelected = null;
let tictactoeGrid = [];
let tictactoeCurrentPlayer = '💋';

// Fonction pour jouer un son
function jouerSon(nomFichier) {
  try {
    const audio = new Audio(`sons/${nomFichier}`);
    audio.volume = 0.5; // Volume à 50%
    audio.play().catch(e => console.log('Erreur audio:', e));
  } catch (e) {
    console.log('Fichier audio non trouvé:', nomFichier);
  }
}

// Fonction pour jouer un son de clic aléatoire
function jouerClicAleatoire() {
  const clics = ['click1.wav', 'click2.wav', 'click3.wav', 'click4.wav', 'click5.wav'];
  const clicAleatoire = clics[Math.floor(Math.random() * clics.length)];
  jouerSon(clicAleatoire);
}

function afficher(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
  
  // Son spécial pour le bouton GO
  if (pageId === 'menu') {
    jouerSon('oh-yes.wav');
  }
  
  // Nettoyage spécifique selon la page
  if (pageId === 'menu' && (reponsesFemme.length > 0 || reponsesHomme.length > 0)) {
    nettoyerApresJeu();
  } else if (pageId === 'questionnaire') {
    chargerQuestions();
  } else if (pageId === 'roulette') {
    chargerRoulette();
  }
}

function nettoyerApresJeu() {
  // Nettoyer les résultats du questionnaire
  document.getElementById('resultat').innerHTML = '';
  document.getElementById('questions-container').innerHTML = '';
  document.getElementById('message-transition').textContent = '';
  
  // Nettoyer la roulette
  document.getElementById('roulette-resultat').innerHTML = '';
  document.getElementById('roulette-resultat').classList.remove('visible');
  if (rouletteAnimation) cancelAnimationFrame(rouletteAnimation);
  angle = 0;
  
  // Réinitialiser les variables du questionnaire
  phase = "femme";
  index = 0;
  reponsesFemme = [];
  reponsesHomme = [];
}

function afficherMiniJeux() {
  afficher('mini-jeux');
}

function lancerMiniJeu(type) {
  afficher('jeu-' + type);
  if (type === 'demineur') initialiserDemineur();
  else if (type === 'candy') initialiserCandyCrush();
  else if (type === 'tictactoe') initialiserTicTacToe();
}

// =================== QUESTIONNAIRE ===================
function chargerQuestions() {
  fetch('./data/questions.json')
    .then(response => response.json())
    .then(data => {
      questions = data;
      phase = "femme";
      index = 0;
      reponsesFemme = [];
      reponsesHomme = [];
      afficherQuestion();
    })
    .catch(error => {
      console.error('Erreur lors du chargement des questions:', error);
      // Fallback avec données par défaut
      questions = [
        { id: 1, question: "Préférez-vous dominer ou être dominé ?", options: ["Dominer", "Être dominé", "Les deux"] },
        { id: 2, question: "Quel type de préliminaires préférez-vous ?", options: ["Oral", "Caresses", "Massages"] },
        { id: 3, question: "Quel est votre lieu préféré pour faire l'amour ?", options: ["Lit", "Douche", "Endroit insolite"] }
      ];
      afficherQuestion();
    });
}

function afficherQuestion() {
  const questionnaire = document.getElementById('questionnaire');
  questionnaire.className = `page ${phase}`;
  
  document.getElementById('titre-phase').textContent = phase === "femme" ? "Phase : Elle 💋" : "Phase : Lui 🔥";
  let container = document.getElementById('questions-container');
  container.innerHTML = '';

  if (index >= questions.length) {
    if (phase === "femme") {
      phase = "homme";
      index = 0;
      document.getElementById('message-transition').textContent = "C'est au tour de Monsieur...";
      
      // Ajouter un bouton OK pour continuer
      let btnOk = document.createElement('button');
      btnOk.textContent = "OK";
      btnOk.className = 'ok-btn';
      btnOk.onclick = () => {
        jouerClicAleatoire();
        document.getElementById('message-transition').textContent = "";
        container.innerHTML = '';
        afficherQuestion();
      };
      container.appendChild(btnOk);
      return;
    } else {
      afficherResultats();
    }
    return;
  }

  let question = questions[index];
  let h3 = document.createElement('h3');
  h3.textContent = question.question;
  container.appendChild(h3);

  question.options.forEach((option, i) => {
    let btn = document.createElement('button');
    btn.textContent = option;
    btn.className = 'reponse-btn';
    btn.onclick = () => {
      jouerClicAleatoire(); // Son de clic aléatoire
      if (phase === "femme") reponsesFemme.push(i);
      else reponsesHomme.push(i);
      index++;
      afficherQuestion();
    };
    container.appendChild(btn);
  });
}

function afficherResultats() {
  let resultatDiv = document.getElementById('resultat');
  resultatDiv.innerHTML = '<h2>💞 Résultats de Compatibilité</h2>';

  let score = 0;
  let tableau = '<div class="tableau-container"><table class="tableau-mobile"><thead><tr><th class="question-cell">Question</th><th class="reponse-cell">Elle</th><th class="reponse-cell">Lui</th><th>✔️</th></tr></thead><tbody>';
  
  questions.forEach((q, i) => {
    let femme = q.options[reponsesFemme[i]];
    let homme = q.options[reponsesHomme[i]];
    let match = reponsesFemme[i] === reponsesHomme[i];
    if (match) score++;
    
    let rowClass = match ? 'match' : 'mismatch';
    tableau += `<tr class="${rowClass}">
      <td class="question-cell">${q.question}</td>
      <td class="reponse-cell">${femme}</td>
      <td class="reponse-cell">${homme}</td>
      <td>${match ? '✔️' : '❌'}</td>
    </tr>`;
  });
  tableau += '</tbody></table></div>';

  let pourcentage = Math.round((score / questions.length) * 100);
  resultatDiv.innerHTML += `<p>Compatibilité : <strong>${pourcentage}%</strong></p>`;
  resultatDiv.innerHTML += tableau;
  
  let retour = document.createElement('button');
  retour.textContent = "Retour au menu";
  retour.onclick = () => afficher('menu');
  resultatDiv.appendChild(retour);
  
  afficher('resultat');
}

// =================== ROULETTE ===================
let angle = 0;
let rouletteAnimation;

function chargerRoulette() {
  fetch('./data/roulette.json')
    .then(res => res.json())
    .then(data => {
      rouletteData = data;
      rouletteGages = data.gages;
      
      drawWheel();
    })
    .catch(error => {
      console.error('Erreur lors du chargement de la roulette:', error);
      // Fallback avec données par défaut
      rouletteGages = [
        { type: "doux", texte: "Fais un massage sensuel à ton/ta partenaire pendant 3 minutes." },
        { type: "coquin", texte: "Embrasse ton/ta partenaire lentement pendant 1 minute, sans les mains." },
        { type: "osé", texte: "Retire un vêtement de ton choix... doucement." },
        { type: "jeu", texte: "Utilisez un glaçon pour explorer le corps de l'autre." },
        { type: "jeu", texte: "Lèche une partie du corps de ton/ta partenaire (hors zone intime)." },
        { type: "coquin", texte: "Lis un fantasme à voix haute que tu aimerais essayer." },
        { type: "doux", texte: "Fais un compliment sexy et sincère à ton/ta partenaire." },
        { type: "osé", texte: "Utilisez uniquement vos lèvres pendant 60 secondes..." }
      ];
      drawWheel();
    });
}

function drawWheel() {
  let canvas = document.getElementById('wheel');
  if (!canvas || !rouletteGages.length) return;
  
  let ctx = canvas.getContext('2d');
  let size = rouletteGages.length;
  let arc = 2 * Math.PI / size;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < size; i++) {
    let angleStart = i * arc + angle;
    let type = rouletteGages[i].type;
    
    // Couleurs selon le type
    let color = '#ff69b4'; // couleur par défaut
    switch(type) {
      case 'doux': color = '#ff69b4'; break;
      case 'coquin': color = '#e91e63'; break;
      case 'osé': color = '#c2185b'; break;
      case 'jeu': color = '#ad1457'; break;
      default: color = '#ff69b4';
    }
    
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 200, angleStart, angleStart + arc);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texte du segment
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angleStart + arc / 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type, 120, 5);
    ctx.restore();
  }
  
  // Flèche indicatrice
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.moveTo(250, 30);
  ctx.lineTo(240, 50);
  ctx.lineTo(260, 50);
  ctx.fill();
}

function afficherDefi(defi) {
  const res = document.getElementById('roulette-resultat');
  res.innerHTML = `
    <div class="defi-content fireworks-animation">
      <div class="feu-artifice">🎆✨🎉</div>
      <p><strong>Votre défi :</strong></p>
      <p>${defi}</p>
      <button class="retour-menu-btn" onclick="afficher('menu')">Retour au menu</button>
    </div>
  `;
  res.classList.add("visible");
}

document.getElementById("spin").addEventListener("click", () => {
  if (!rouletteGages.length) return;
  
  let tours = Math.floor(Math.random() * 5) + 5;
  let finalAngle = Math.random() * 2 * Math.PI;
  let totalRotation = tours * 2 * Math.PI + finalAngle;
  let startAngle = angle;
  let duration = 3000; // 3 secondes
  let startTime = Date.now();

  function rotate() {
    let elapsed = Date.now() - startTime;
    let progress = Math.min(elapsed / duration, 1);
    
    // Easing pour ralentir progressivement
    let easeOut = 1 - Math.pow(1 - progress, 3);
    angle = startAngle + totalRotation * easeOut;
    
    drawWheel();
    
    if (progress < 1) {
      rouletteAnimation = requestAnimationFrame(rotate);
    } else {
      // Calculer le résultat
      let normalizedAngle = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);
      let segmentAngle = 2 * Math.PI / rouletteGages.length;
      let index = Math.floor(normalizedAngle / segmentAngle) % rouletteGages.length;
      let defi = rouletteGages[index];
      
      setTimeout(() => afficherDefi(defi.texte), 500);
    }
  }

  rotate();
});

// =================== MINI JEUX ===================

// DÉMINEUR SEXY
function initialiserDemineur() {
  deminerGrid = [];
  const container = document.getElementById('demineur-grille');
  container.innerHTML = '';
  
  // Créer la grille
  for (let i = 0; i < deminerSize * deminerSize; i++) {
    deminerGrid.push({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    });
  }
  
  // Placer les mines
  let minesPlaced = 0;
  while (minesPlaced < deminerMines) {
    let randomIndex = Math.floor(Math.random() * deminerGrid.length);
    if (!deminerGrid[randomIndex].isMine) {
      deminerGrid[randomIndex].isMine = true;
      minesPlaced++;
    }
  }
  
  // Calculer les nombres
  for (let i = 0; i < deminerGrid.length; i++) {
    if (!deminerGrid[i].isMine) {
      deminerGrid[i].neighborMines = compterMinesVoisines(i);
    }
  }
  
  // Créer l'interface
  deminerGrid.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.className = 'demineur-cell';
    cellElement.onclick = () => revelerCellule(index);
    cellElement.oncontextmenu = (e) => {
      e.preventDefault();
      toggleFlag(index);
    };
    container.appendChild(cellElement);
  });
}

function compterMinesVoisines(index) {
  const row = Math.floor(index / deminerSize);
  const col = index % deminerSize;
  let count = 0;
  
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < deminerSize && c >= 0 && c < deminerSize) {
        const neighborIndex = r * deminerSize + c;
        if (deminerGrid[neighborIndex] && deminerGrid[neighborIndex].isMine) {
          count++;
        }
      }
    }
  }
  return count;
}

function revelerCellule(index) {
  const cell = deminerGrid[index];
  const cellElement = document.getElementById('demineur-grille').children[index];
  
  if (cell.isRevealed || cell.isFlagged) return;
  
  cell.isRevealed = true;
  cellElement.classList.add('revealed');
  
  if (cell.isMine) {
    cellElement.textContent = '💣';
    cellElement.classList.add('mine');
    afficherMessage('💥 Boom! Vous avez touché une mine sexy! 💥');
    return;
  }
  
  if (cell.neighborMines > 0) {
    cellElement.textContent = cell.neighborMines;
  } else {
    // Révéler automatiquement les cellules voisines
    revelerVoisines(index);
  }
  
  verifierVictoire();
}

function revelerVoisines(index) {
  const row = Math.floor(index / deminerSize);
  const col = index % deminerSize;
  
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < deminerSize && c >= 0 && c < deminerSize) {
        const neighborIndex = r * deminerSize + c;
        if (!deminerGrid[neighborIndex].isRevealed) {
          revelerCellule(neighborIndex);
        }
      }
    }
  }
}

function toggleFlag(index) {
  const cell = deminerGrid[index];
  const cellElement = document.getElementById('demineur-grille').children[index];
  
  if (cell.isRevealed) return;
  
  cell.isFlagged = !cell.isFlagged;
  cellElement.textContent = cell.isFlagged ? '🚩' : '';
  cellElement.classList.toggle('flagged');
}

function verifierVictoire() {
  const cellsToReveal = deminerGrid.filter(cell => !cell.isMine && !cell.isRevealed);
  if (cellsToReveal.length === 0) {
    afficherMessage('🎉 Félicitations! Vous avez gagné! 🎉');
  }
}

// CANDY CRUSH SEXY
function initialiserCandyCrush() {
  candyGrid = [];
  candyScore = 0;
  candySelected = null;
  document.getElementById('candy-score').textContent = candyScore;
  
  const container = document.getElementById('candy-grille');
  container.innerHTML = '';
  
  const candies = ['💋', '💄', '👠', '🌹', '💎', '🍓'];
  
  // Créer la grille
  for (let i = 0; i < candySize * candySize; i++) {
    const candy = candies[Math.floor(Math.random() * candies.length)];
    candyGrid.push(candy);
    
    const cellElement = document.createElement('div');
    cellElement.className = 'candy-cell';
    cellElement.textContent = candy;
    cellElement.onclick = () => selectionnerCandy(i);
    container.appendChild(cellElement);
  }
}

function selectionnerCandy(index) {
  const cellElement = document.getElementById('candy-grille').children[index];
  
  if (candySelected === null) {
    candySelected = index;
    cellElement.classList.add('selected');
  } else if (candySelected === index) {
    candySelected = null;
    cellElement.classList.remove('selected');
  } else {
    // Vérifier si les cellules sont adjacentes
    if (sontAdjacentes(candySelected, index)) {
      echangerCandies(candySelected, index);
      document.getElementById('candy-grille').children[candySelected].classList.remove('selected');
      candySelected = null;
      
      setTimeout(() => {
        verifierMatches();
        mettreAJourAffichage();
      }, 300);
    } else {
      document.getElementById('candy-grille').children[candySelected].classList.remove('selected');
      candySelected = index;
      cellElement.classList.add('selected');
    }
  }
}

function sontAdjacentes(index1, index2) {
  const row1 = Math.floor(index1 / candySize);
  const col1 = index1 % candySize;
  const row2 = Math.floor(index2 / candySize);
  const col2 = index2 % candySize;
  
  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

function echangerCandies(index1, index2) {
  const temp = candyGrid[index1];
  candyGrid[index1] = candyGrid[index2];
  candyGrid[index2] = temp;
}

function verifierMatches() {
  let matches = [];
  
  // Vérifier les lignes
  for (let row = 0; row < candySize; row++) {
    let count = 1;
    for (let col = 1; col < candySize; col++) {
      const current = row * candySize + col;
      const previous = row * candySize + col - 1;
      
      if (candyGrid[current] === candyGrid[previous]) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = col - count; i < col; i++) {
            matches.push(row * candySize + i);
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let i = candySize - count; i < candySize; i++) {
        matches.push(row * candySize + i);
      }
    }
  }
  
  // Vérifier les colonnes
  for (let col = 0; col < candySize; col++) {
    let count = 1;
    for (let row = 1; row < candySize; row++) {
      const current = row * candySize + col;
      const previous = (row - 1) * candySize + col;
      
      if (candyGrid[current] === candyGrid[previous]) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = row - count; i < row; i++) {
            matches.push(i * candySize + col);
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let i = candySize - count; i < candySize; i++) {
        matches.push(i * candySize + col);
      }
    }
  }
  
  if (matches.length > 0) {
    candyScore += matches.length * 10;
    document.getElementById('candy-score').textContent = candyScore;
    
    // Supprimer les matches
    matches.forEach(index => {
      candyGrid[index] = null;
    });
    
    // Faire tomber les candies
    faireTomberCandies();
    
    // Ajouter de nouveaux candies
    ajouterNouveauxCandies();
    
    // Vérifier à nouveau
    setTimeout(() => verifierMatches(), 500);
  }
}

function faireTomberCandies() {
  for (let col = 0; col < candySize; col++) {
    let writeIndex = candySize - 1;
    for (let row = candySize - 1; row >= 0; row--) {
      const index = row * candySize + col;
      if (candyGrid[index] !== null) {
        const newIndex = writeIndex * candySize + col;
        candyGrid[newIndex] = candyGrid[index];
        if (newIndex !== index) {
          candyGrid[index] = null;
        }
        writeIndex--;
      }
    }
  }
}

function ajouterNouveauxCandies() {
  const candies = ['💋', '💄', '👠', '🌹', '💎', '🍓'];
  
  for (let i = 0; i < candyGrid.length; i++) {
    if (candyGrid[i] === null) {
      candyGrid[i] = candies[Math.floor(Math.random() * candies.length)];
    }
  }
}

function mettreAJourAffichage() {
  const container = document.getElementById('candy-grille');
  candyGrid.forEach((candy, index) => {
    container.children[index].textContent = candy;
  });
}

// TIC-TAC-TOE SEXY
function initialiserTicTacToe() {
  tictactoeGrid = Array(9).fill('');
  tictactoeCurrentPlayer = '💋';
  document.getElementById('tictactoe-joueur').textContent = tictactoeCurrentPlayer;
  
  const container = document.getElementById('tictactoe-grille');
  container.innerHTML = '';
  
  for (let i = 0; i < 9; i++) {
    const cellElement = document.createElement('div');
    cellElement.className = 'tictactoe-cell';
    cellElement.onclick = () => jouerTicTacToe(i);
    container.appendChild(cellElement);
  }
}

function jouerTicTacToe(index) {
  if (tictactoeGrid[index] !== '') return;
  
  tictactoeGrid[index] = tictactoeCurrentPlayer;
  const cellElement = document.getElementById('tictactoe-grille').children[index];
  cellElement.textContent = tictactoeCurrentPlayer;
  
  if (verifierVictoireTicTacToe()) {
    afficherMessage(`🎉 ${tictactoeCurrentPlayer} a gagné! 🎉`);
    return;
  }
  
  if (tictactoeGrid.every(cell => cell !== '')) {
    afficherMessage('🤝 Match nul! 🤝');
    return;
  }
  
  tictactoeCurrentPlayer = tictactoeCurrentPlayer === '💋' ? '🔥' : '💋';
  document.getElementById('tictactoe-joueur').textContent = tictactoeCurrentPlayer;
}

function verifierVictoireTicTacToe() {
  const lignesGagnantes = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
    [0, 4, 8], [2, 4, 6] // diagonales
  ];
  
  return lignesGagnantes.some(ligne => {
    const [a, b, c] = ligne;
    return tictactoeGrid[a] && 
           tictactoeGrid[a] === tictactoeGrid[b] && 
           tictactoeGrid[a] === tictactoeGrid[c];
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
}

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  // Charger les données initiales si nécessaire
  console.log('DuoLove chargé avec succès!');
});

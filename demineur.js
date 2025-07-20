// Démineur Sexy à 2 joueurs - Logique complète
let deminerGrid = [];
let deminerSize = 8;
let deminerMines = 10;
let currentPlayer = 1;
let gameState = 'playing'; // 'playing', 'round-end', 'game-end'
let scores = { player1: 0, player2: 0 };
let currentRound = 1;
let maxRounds = 6;
let gameHistory = [];
let usedISTs = []; // Pour éviter les doublons d'IST dans une partie

// Liste des IST pour les messages de défaite
const istList = [
  "L'hépatite B",
  "La syphilis", 
  "L'herpès génital",
  "Une candidose",
  "L'herpès",
  "Une infection urinaire",
  "La chlamydiose"
];

// Messages de victoire pour les cartes bonus
const bonusCards = [
  "Massage sensuel de 10 minutes offert par ton/ta partenaire",
  "Strip-tease personnalisé de 5 minutes",
  "Séance de caresses intimes de ton choix",
  "Jeu de rôle au choix pendant 15 minutes",
  "Préliminaires dirigés par toi uniquement",
  "Massage avec huile chaude partout où tu veux"
];

function initialiserDemineurDeuxJoueurs() {
  resetGame();
  updateGameInfo();
  createGrid();
}

function resetGame() {
  deminerGrid = [];
  currentPlayer = 1;
  gameState = 'playing';
  scores = { player1: 0, player2: 0 };
  currentRound = 1;
  gameHistory = [];
  usedISTs = []; // Réinitialiser les IST utilisées
  
  // Nettoyer les messages précédents
  const resultContainer = document.getElementById('demineur-resultat');
  if (resultContainer) {
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('visible');
  }
}

function createGrid() {
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
  
  // Placer les virus (mines)
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
    container.appendChild(cellElement);
  });
  
  gameState = 'playing';
  updateGameInfo();
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
  if (gameState !== 'playing') return;
  
  const cell = deminerGrid[index];
  const cellElement = document.getElementById('demineur-grille').children[index];
  
  if (cell.isRevealed || cell.isFlagged) return;
  
  cell.isRevealed = true;
  cellElement.classList.add('revealed');
  
  if (cell.isMine) {
    // Joueur a touché un virus (IST)
    cellElement.textContent = '🦠';
    cellElement.classList.add('virus');
    
    // Animation de défaite
    cellElement.style.animation = 'virusExplosion 0.8s ease-out';
    
    // Choisir une IST aléatoire
    const randomIST = istList[Math.floor(Math.random() * istList.length)];
    
    // Message de défaite
    setTimeout(() => {
      showRoundResult(false, randomIST);
    }, 1000);
    
    gameState = 'round-end';
    return;
  }
  
  if (cell.neighborMines > 0) {
    cellElement.textContent = cell.neighborMines;
    cellElement.classList.add(`number-${cell.neighborMines}`);
  } else {
    // Révéler automatiquement les cellules voisines
    revelerVoisines(index);
  }
  
  // Vérifier si le joueur a gagné la manche
  if (verifierVictoire()) {
    gameState = 'round-end';
    setTimeout(() => {
      showRoundResult(true);
    }, 500);
  }
}

function revelerVoisines(index) {
  const row = Math.floor(index / deminerSize);
  const col = index % deminerSize;
  
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < deminerSize && c >= 0 && c < deminerSize) {
        const neighborIndex = r * deminerSize + c;
        if (!deminerGrid[neighborIndex].isRevealed && !deminerGrid[neighborIndex].isMine) {
          revelerCellule(neighborIndex);
        }
      }
    }
  }
}

function verifierVictoire() {
  const cellsToReveal = deminerGrid.filter(cell => !cell.isMine && !cell.isRevealed);
  return cellsToReveal.length === 0;
}

function showRoundResult(won, ist = null) {
  const resultContainer = document.getElementById('demineur-resultat');
  
  if (won) {
    jouerSon('victoire.wav'); // Son de victoire
    scores[`player${currentPlayer}`]++;
    gameHistory.push({
      round: currentRound,
      winner: currentPlayer,
      ist: null
    });
    
    resultContainer.innerHTML = `
      <div class="round-result victory">
        <div class="celebration">🎉✨🏆</div>
        <h3>Manche ${currentRound} - Victoire!</h3>
        <p><strong>Joueur ${currentPlayer}</strong> remporte cette manche!</p>
        <p class="victory-message">Aucune IST attrapée, bravo! 👏</p>
        <button onclick="nextRound()" class="next-round-btn">Manche suivante</button>
      </div>
    `;
  } else {
    jouerSon('defaite.wav'); // Son de défaite
    gameHistory.push({
      round: currentRound,
      winner: currentPlayer === 1 ? 2 : 1,
      ist: ist
    });
    
    scores[`player${currentPlayer === 1 ? 2 : 1}`]++;
    
    resultContainer.innerHTML = `
      <div class="round-result defeat">
        <div class="virus-animation">🦠💥😱</div>
        <h3>Manche ${currentRound} - Défaite!</h3>
        <p><strong>Joueur ${currentPlayer}</strong> a attrapé:</p>
        <p class="ist-name">${ist}</p>
        <p class="defeat-message">Va me soigner ça! 😷</p>
        <p class="winner-message">Joueur ${currentPlayer === 1 ? 2 : 1} remporte cette manche!</p>
        <button onclick="nextRound()" class="next-round-btn">Manche suivante</button>
      </div>
    `;
  }
  
  resultContainer.classList.add('visible');
}

function nextRound() {
  currentRound++;
  
  if (currentRound > maxRounds) {
    showFinalResult();
    return;
  }
  
  // Changer de joueur pour la prochaine manche
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  
  // Masquer les résultats et créer une nouvelle grille
  document.getElementById('demineur-resultat').classList.remove('visible');
  createGrid();
}

function showFinalResult() {
  const resultContainer = document.getElementById('demineur-resultat');
  const winner = scores.player1 > scores.player2 ? 1 : scores.player2 > scores.player1 ? 2 : null;
  
  let resultHTML = `
    <div class="final-result">
      <h2>🏁 Résultats Finaux 🏁</h2>
      <div class="scores">
        <div class="score-player">
          <span class="player-name">Joueur 1</span>
          <span class="score">${scores.player1}</span>
        </div>
        <div class="score-player">
          <span class="player-name">Joueur 2</span>
          <span class="score">${scores.player2}</span>
        </div>
      </div>
      
      <div class="history">
        <h4>Historique des manches:</h4>
        ${gameHistory.map(h => `
          <div class="history-item">
            <strong>Manche ${h.round}:</strong> Joueur ${h.winner} gagne
            ${h.ist ? `<br><em>Joueur ${h.winner === 1 ? 2 : 1} a attrapé: ${h.ist}</em>` : ''}
          </div>
        `).join('')}
      </div>
  `;
  
  if (winner) {
    const randomBonus = bonusCards[Math.floor(Math.random() * bonusCards.length)];
    resultHTML += `
      <div class="winner-section">
        <div class="trophy-animation">🏆✨🎊</div>
        <h3>🎉 Joueur ${winner} remporte la partie! 🎉</h3>
        <div class="bonus-card">
          <h4>🎁 Carte Bonus Torride 🔥</h4>
          <p class="bonus-text">${randomBonus}</p>
        </div>
      </div>
    `;
  } else {
    resultHTML += `
      <div class="tie-section">
        <h3>🤝 Match nul! 🤝</h3>
        <p>Vous méritez tous les deux une récompense!</p>
      </div>
    `;
  }
  
  resultHTML += `
      <div class="final-buttons">
        <button onclick="initialiserDemineurDeuxJoueurs()" class="new-game-btn">Nouvelle partie</button>
        <button onclick="afficherMiniJeux()" class="back-btn">Retour aux jeux</button>
      </div>
    </div>
  `;
  
  resultContainer.innerHTML = resultHTML;
  resultContainer.classList.add('visible');
  gameState = 'game-end';
}

function updateGameInfo() {
  const infoContainer = document.getElementById('demineur-info');
  if (infoContainer) {
    infoContainer.innerHTML = `
      <div class="game-status">
        <div class="round-info">Manche ${currentRound}/${maxRounds}</div>
        <div class="current-player">Tour de: Joueur ${currentPlayer}</div>
        <div class="scores-display">
          <span>J1: ${scores.player1}</span> | <span>J2: ${scores.player2}</span>
        </div>
      </div>
    `;
  }
}
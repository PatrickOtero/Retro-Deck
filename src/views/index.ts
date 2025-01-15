const gameListElement = document.getElementById('game-list') as HTMLElement;
const emulatorListElement = document.querySelector('.emulators-list') as HTMLElement;
const emulatorListContainerElement = document.getElementById('emulator-list-container') as HTMLElement;
const prevButton = document.getElementById('prev-button') as HTMLElement;
const nextButton = document.getElementById('next-button') as HTMLElement;
const toggleButton = document.getElementById('toggle-button');
const closeButton = document.getElementById('close-button') as HTMLElement;

let selectedEmulator: any = null;

let games: Array<any> = [];
let emulators: Array<any> = []
let currentIndex: number = 0;

let isButtonAPressed = false;
let isButtonStartPressed = false;
let lastAxisX = 0;
let moveCooldown = false; 

function detectGamepad(): void {
  const gamepads = navigator.getGamepads();

  if (gamepads) {
    const gamepad = gamepads[0]; 

    if (gamepad) {
      
      if (gamepad.buttons[0].pressed && !isButtonAPressed) { 
        isButtonAPressed = true;
        startGame(); 
      } else if (!gamepad.buttons[0].pressed) {
        isButtonAPressed = false;
      }

      
      if (gamepad.buttons[9].pressed && !isButtonStartPressed) { 
        isButtonStartPressed = true;
        startGame(); 
      } else if (!gamepad.buttons[9].pressed) {
        isButtonStartPressed = false;
      }

      if (gamepad.axes[0] > 0.2 && !moveCooldown) { 
        moveToNextGame(); 
        lastAxisX = gamepad.axes[0];
        moveCooldown = true; 
        setTimeout(() => { moveCooldown = false; }, 300); 
      } else if (gamepad.axes[0] < -0.2 && !moveCooldown) { 
        moveToPrevGame(); 
        lastAxisX = gamepad.axes[0];
        moveCooldown = true; 
        setTimeout(() => { moveCooldown = false; }, 300); 
      }
    }
  }

  requestAnimationFrame(detectGamepad); 
}

detectGamepad();

function generateStars(): void {
  const starCount = Math.floor(window.innerWidth * window.innerHeight / 10000); 
  const background = document.getElementById('background') as HTMLElement;
  const sizeRange = [1.5, 5]; 

  background.innerHTML = '';

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;

    background.appendChild(star);

    
    moveStar(star);
  }
}

function moveStar(star: HTMLElement): void {
  const screenHeight = window.innerHeight;
  const speed = Math.random() * 2 + 0.5; 

  function animateStar(): void {
    const currentTop = parseFloat(star.style.top);
    
    if (currentTop < -10) { 
      star.style.top = `${screenHeight + 10}px`;
    } else {
      star.style.top = `${currentTop - speed}px`; 
    }

    requestAnimationFrame(animateStar); 
  }

  animateStar(); 
}

window.onload = generateStars;

window.addEventListener('resize', () => {
  generateStars();
  renderGames();
  // renderEmulators()
});

console.log(emulators)

async function loadEmulators(): Promise<void> {
  try {
    const loadingElement = document.getElementById('loading')!;
    loadingElement.style.opacity = '1';

    if (emulators.length === 0) {
      console.log('Chamando registerEmulators...');
  
      await window.electronAPI.registerEmulator();

      console.log('Emuladores registrados com sucesso');
    }

    emulators = await window.electronAPI.getEmulator();

    console.log(emulators);

    nextButton.style.display = "none"
    prevButton.style.display = "none"

    renderEmulators();
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 500);
  } catch (error) {
    console.error('Erro ao carregar emuladores:', error);
  }
}

function renderEmulators(): void {
  if (emulators.length === 0) {
    console.log('Nenhum emulador encontrado.');
    return;
  }

  emulatorListElement.innerHTML = ''; 

  const emulatorContainer = createEmulatorContainer(emulators);

  emulatorListElement.appendChild(emulatorContainer);
}

function createEmulatorContainer(emulators: any): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('game-list-item-container');

  for (let emulator of emulators) {
    const emulatorTitle = document.createElement('h3');
    emulatorTitle.classList.add('emulator-title');
    emulatorTitle.textContent = emulator.emulatorName;

    emulatorTitle.onclick = () => selectEmulator(emulator);

    container.appendChild(emulatorTitle);
  }

  return container;
}

function selectEmulator(emulator: any): void {
  selectedEmulator = emulator;
  console.log('Emulador selecionado:', selectedEmulator);

  emulatorListElement.classList.add('hidden');

  const gameSelector = document.getElementById('game-selector');
  if (gameSelector) {
    gameSelector.style.display = 'block';
    nextButton.style.display = "block"
    prevButton.style.display = "block"
    emulatorListContainerElement.style.display = "none"
  }

  loadGames();
}

async function loadGames(): Promise<void> {
  try {
    const loadingElement = document.getElementById('loading')!;
    loadingElement.style.opacity = '1';

    games = await window.electronAPI.getGames();

    if (games.length === 0) {
      displayNoGamesMessage();
      return;
    }

    renderGames();
 
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 500); 
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
  }
}

function displayNoGamesMessage(): void {
  gameListElement.innerHTML = '<li>Nenhum jogo encontrado</li>';
}

function renderGames(): void {
  if (games.length === 0) return; 

  gameListElement.innerHTML = ''; 

  const game = games[currentIndex];

  const gameContainer = createGameContainer(game);

  gameListElement.appendChild(gameContainer);
}

function createGameContainer(game: any): HTMLElement {
  const container = document.createElement('div');
  container.classList.add("game-info-container");

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('game-image-container');

  const img = document.createElement('img');
  img.classList.add('game-image');
  img.src = game.backgroundImage || 'placeholder.png';
  img.alt = game.gameName;

  imageContainer.appendChild(img);

  const nameContainer = document.createElement('div');
  nameContainer.classList.add('game-name-container');

  const h3 = document.createElement('h3');
  h3.textContent = game.gameName;
  nameContainer.appendChild(h3);

  const descContainer = document.createElement('div');
  descContainer.classList.add('desc-container');

  const p = document.createElement('p');
  p.textContent = game.description;
  descContainer.appendChild(p);

  const startButton = document.createElement('button');
  startButton.classList.add('start-game-button');
  startButton.textContent = 'Iniciar Jogo';
  startButton.onclick = () => startGame();

  container.appendChild(imageContainer);
  container.appendChild(nameContainer);
  container.appendChild(descContainer);
  container.appendChild(startButton);

  return container;
}

async function startGame() {
  if (!selectedEmulator) {
    alert('Selecione um emulador primeiro!');
    return;
  }

  const isRunning = await window.electronAPI.isEmulatorRunning();

  if (isRunning) {
    alert('O emulador já está em execução.');
    return;
  }

  const result = await window.electronAPI.runGame(games[currentIndex].fileName, selectedEmulator.emulatorName);

  if (!result.success) {
    console.error('Erro ao tentar iniciar o jogo.');
  } else {
    console.log('Jogo iniciado com sucesso.');
  }
}

function moveToNextGame(): void {
  currentIndex = (currentIndex + 1) % games.length; 
  renderGames();
}

function moveToPrevGame(): void {
  currentIndex = (currentIndex - 1 + games.length) % games.length; 
  renderGames();
}

prevButton.addEventListener('click', moveToPrevGame);
nextButton.addEventListener('click', moveToNextGame);

loadEmulators();
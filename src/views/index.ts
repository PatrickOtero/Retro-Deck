const gameListElement = document.getElementById('game-list') as HTMLElement;
const emulatorListElement = document.querySelector('.emulators-list') as HTMLElement;
const emulatorListContainerElement = document.getElementById('emulator-list-container') as HTMLElement;
const prevButton = document.getElementById('prev-button') as HTMLElement;
const nextButton = document.getElementById('next-button') as HTMLElement;
const toggleButton = document.getElementById('toggle-button');
const closeButton = document.getElementById('close-button') as HTMLElement;
const loadingElement = document.getElementById('loading')!;
const reloadButton = document.querySelector(".no-content-button") as HTMLElement;
const emulatorsButton = document.getElementById('emulators-button') as HTMLElement;
const exitButton = document.getElementById('exit-button') as HTMLElement;
const backButton = document.getElementById('back-button') as HTMLElement;



let selectedEmulator: any = null;

let games: Array<any> = [];
let emulators: Array<any> = []
let currentIndex: number = 0;

let isButtonAPressed = false;
let isButtonStartPressed = false;
let lastAxisX = 0;
let lastAxisY = 0;
let moveCooldown = false; 

let isCarrouselOpen = false
let isEmulatorMenuOpen = false;
let isFirstEmulatorSelected = false;

let emulatorIndex = 0;
let buttonsIndex = 0

let mainMenuOpen = true

console.log("carroussel open: " + isCarrouselOpen +  " " + "emulator list: " + isEmulatorMenuOpen + " " + "main menu open: " + mainMenuOpen)

const buttons = [emulatorsButton, exitButton, reloadButton, backButton];

function highlightButton(index: number) {
  buttons.forEach((button, i) => {
    button.classList.toggle('selected', i === index);
  });
}

function mainMenuLoader() {
  console.log("carroussel open: " + isCarrouselOpen +  " " + "emulator list: " + isEmulatorMenuOpen + " " + "main menu open: " + mainMenuOpen)

  mainMenuOpen = true

  const emulatorsButton = document.getElementById('emulators-button') as HTMLElement;
  const exitButton = document.getElementById('exit-button') as HTMLElement;
  const mainMenu = document.getElementById('main-menu') as HTMLElement;
  const emulatorListContainer = document.getElementById('emulator-list-container') as HTMLElement;
  const gameSelector = document.getElementById('game-selector') as HTMLElement

  mainMenu.classList.add("visible")
  emulatorListContainer.style.display = "none";
  gameSelector.style.display = "none"

  emulatorsButton.addEventListener('click', async () => {
    mainMenuOpen = false
    isEmulatorMenuOpen = true
    loadEmulators();
    mainMenu.style.display = "none"
    emulatorListContainer.style.display = "block"
  });

  exitButton.addEventListener('click', () => {
    window.close();
  });
}

function noContentWarning(): void {
  const emulatorList = document.querySelector("#emulator-list-container") as HTMLElement;

  nextButton.style.display = "none"
  prevButton.style.display = "none"

  const appTitle = document.querySelector(".select-game-title") as HTMLElement

  const noContentButton = document.createElement("button")
  noContentButton.classList.add("no-content-button")
  noContentButton.innerHTML = "Reload"

  appTitle.style.display = "none"

  if (!emulatorList) {
    console.error("Emulator list container not found!");
    return;
  }
  
  const noContentContainer = document.createElement("div");
  noContentContainer.classList.add("no-content-container");

  const noContentTitle = document.createElement("h1");
  noContentTitle.innerHTML = "No Content!";
  noContentTitle.classList.add("no-content-title");

  const noContentInfo = document.createElement("p");
  noContentInfo.innerHTML = `
    The program hasn't found any content. <br><br>
    Please create the following folders:<br>
    <strong>'emulators'</strong> for emulator executables<br>
    <strong>'roms'</strong> for respective ROM files<br><br>
    Both should be located inside the <strong>'resources'</strong> folder in the installation directory. After following the instructions, press <strong>'Reload'</strong>
  `;
  noContentInfo.classList.add("no-content-info");

  noContentContainer.appendChild(noContentTitle);
  noContentContainer.appendChild(noContentInfo);
  noContentContainer.appendChild(noContentButton)
  
  emulatorList.appendChild(noContentContainer);

  noContentButton.addEventListener("click", async () => {
    if (!emulators.length) {
      noContentContainer.style.display = "none"

      showLoading()
      loadEmulators()
      hideLoading()
    } else {
      return
    }
  })
}

function getAllEmulatorTitles(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('.emulator-title'), backButton];
}

function highlightItem(items: HTMLElement[], index: number, className: string = 'selected'): void {
  items.forEach((item, i) => {
    item.classList.toggle(className, i === index);
  });
}

function highlightEmulator(index: number): void {
  const emulatorTitles = getAllEmulatorTitles();
  highlightItem(emulatorTitles, index);
}

function highlightMainMenu(index: number): void {
  highlightItem(buttons, index);
}

function handleKeyboardNavigation(event: KeyboardEvent): void {
  if (event.key === 'Escape' && !mainMenuOpen) {
    if (isFirstEmulatorSelected) {
      if (isEmulatorMenuOpen) closeEmulatorMenu();
      else openEmulatorMenu();
    }
    return;
  }

  if (mainMenuOpen) {
    handleMainMenuNavigation(event);
  } else if (isEmulatorMenuOpen) {
    handleEmulatorMenuNavigation(event);
  } else if (isCarrouselOpen) {
    handleCarouselNavigation(event);
  }
}

function handleMainMenuNavigation(event: KeyboardEvent): void {
  const numButtons = buttons.length;
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
    currentIndex = (currentIndex - 1 + numButtons) % numButtons;
    highlightMainMenu(currentIndex);
  } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
    currentIndex = (currentIndex + 1) % numButtons;
    highlightMainMenu(currentIndex);
  } else if (event.key === 'Enter') {
    buttons[currentIndex].click();
  }
}

function handleEmulatorMenuNavigation(event: KeyboardEvent): void {
  const emulatorTitles = getAllEmulatorTitles();
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
    emulatorIndex = (emulatorIndex - 1 + emulatorTitles.length) % emulatorTitles.length;
    highlightEmulator(emulatorIndex);
  } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
    emulatorIndex = (emulatorIndex + 1) % emulatorTitles.length;
    highlightEmulator(emulatorIndex);
  } else if (event.key === 'Enter') {
    selectEmulator(emulators[emulatorIndex]);
  }
}

function handleCarouselNavigation(event: KeyboardEvent): void {
  const prevButton = document.getElementById('prev-button') as HTMLElement;
  const nextButton = document.getElementById('next-button') as HTMLElement;

  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    nextButton?.classList.add('selected');
    prevButton?.classList.remove('selected');
    moveToNextGame();
  } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    prevButton?.classList.add('selected');
    nextButton?.classList.remove('selected');
    moveToPrevGame();
  } else if (event.key === 'Enter') {
    startGame();
  }
}

window.addEventListener('keydown', handleKeyboardNavigation);

function detectGamepad(): void {
  const gamepads = navigator.getGamepads();

  if (gamepads) {
    const gamepad = gamepads[0]; 

    if (gamepad) {

      if (mainMenuOpen) {
      const axisY = gamepad.axes[1];

      if (Math.abs(axisY) > 0.2) {
        if (axisY < -0.2) {
          currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          highlightButton(currentIndex);
        } else if (axisY > 0.2) {
          currentIndex = (currentIndex + 1) % buttons.length;
          highlightButton(currentIndex);
        }
      }

      if (gamepad.buttons[0].pressed) {
        buttons[currentIndex].click();
      }
    }
      
      if ( !isEmulatorMenuOpen ) {
      if (gamepad.buttons[0].pressed && !isButtonAPressed) { 
        isButtonAPressed = true;
        startGame(); 
      } else if (!gamepad.buttons[0].pressed) {
        isButtonAPressed = false;
      }

      const axisX = gamepad.axes[0];

      if (Math.abs(axisX) > 0.2 && !moveCooldown) { 
        if (axisX > 0) {
          nextButton.classList.add('selected');
          prevButton.classList.remove('selected');
    
          moveToNextGame();
        } else {
          prevButton.classList.add('selected');
          nextButton.classList.remove('selected');
    
          moveToPrevGame();
        }

        lastAxisX = axisX;
        moveCooldown = true; 
        setTimeout(() => { moveCooldown = false; }, 300); 
      }
    }

    if (gamepad.buttons[9].pressed && !isButtonStartPressed) { 
      isButtonStartPressed = true;

      if (isFirstEmulatorSelected) {
      if (isEmulatorMenuOpen) {
        closeEmulatorMenu();
      } else {
        openEmulatorMenu();
      }
    }
    
    } else if (!gamepad.buttons[9].pressed) {
      isButtonStartPressed = false;
    }

      if (isEmulatorMenuOpen) {

      const axisY = gamepad.axes[1]; 

      if (Math.abs(axisY) > 0.2 && !moveCooldown) { 

        const emulatorTitles = [...document.querySelectorAll('.emulator-title'), backButton];

        if (axisY < -0.2) { 
          emulatorIndex = (emulatorIndex - 1 + emulatorTitles.length) % emulatorTitles.length;
          highlightEmulator(emulatorIndex);
        } else if (axisY > 0.2) { 
          emulatorIndex = (emulatorIndex + 1) % emulatorTitles.length;
          highlightEmulator(emulatorIndex);
        }
        lastAxisY = axisY;
        moveCooldown = true;
        setTimeout(() => { moveCooldown = false; }, 300); 
      }

      
      if (gamepad.buttons[8].pressed) { 
        selectEmulator(emulators[emulatorIndex]); 
      }
    }
    }
  }

  requestAnimationFrame(detectGamepad); 
}

detectGamepad();

function openEmulatorMenu(): void {
  isEmulatorMenuOpen = true;
  isCarrouselOpen = false

  emulatorListElement.classList.remove('hidden');
  emulatorListContainerElement.style.display = 'block';

  const gameSelector = document.getElementById('game-selector');
  if (gameSelector && isFirstEmulatorSelected) {
    gameSelector.style.display = 'none';
  }

  nextButton.style.display = 'none';
  prevButton.style.display = 'none';

  const gameContainers = document.querySelectorAll('.game-info-container');
  gameContainers.forEach((container) => {
    container.setAttribute('tabindex', '-1');
    container.classList.remove('focused');
  });
}

function closeEmulatorMenu(): void {
  isEmulatorMenuOpen = false;
  isCarrouselOpen = true

  emulatorListElement.classList.add('hidden');
  emulatorListContainerElement.style.display = 'none';
  
  const gameSelector = document.getElementById('game-selector');
  if (gameSelector) {
    gameSelector.style.display = 'block';
  }

  nextButton.style.display = "block";
  prevButton.style.display = "block";

}

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

function arrangeIconsRandomly() {
  const icons = Array.from(document.querySelectorAll<HTMLDivElement>('.icon'));
  const positions = [0, 1, 2, 3];

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  icons.forEach((icon, index) => {
    const newPosition = positions[index];
    icon.style.order = String(newPosition);
  });
}

function applyRandomRotation() {
  const icons = document.querySelectorAll<HTMLElement>('.icon');
  
  icons.forEach(icon => {
    const randomDegree = Math.floor(Math.random() * 360);
    icon.style.transform = `rotate(${randomDegree}deg)`;
  });
}

window.onload = () => {
  mainMenuLoader()
  arrangeIconsRandomly();
  applyRandomRotation();
  generateStars()
};

window.addEventListener('resize', () => {
  arrangeIconsRandomly();
  applyRandomRotation();
  generateStars();
});

function showLoading(): void {
  loadingElement.style.display = 'flex';
  loadingElement.style.opacity = '1';
  loadingElement.style.pointerEvents = 'auto';
}

function hideLoading(): void {
  loadingElement.style.opacity = '0';
  setTimeout(() => {
    loadingElement.style.display = 'none';
  }, 500);
}

function goBackToMenu() {
  console.log("carroussel open: " + isCarrouselOpen +  " " + "emulator list: " + isEmulatorMenuOpen + " " + "main menu open: " + mainMenuOpen)

  isCarrouselOpen = false
  isEmulatorMenuOpen = false
  mainMenuOpen = true

  const mainMenu = document.getElementById('main-menu') as HTMLElement;
  const emulatorListContainer = document.getElementById('emulator-list-container') as HTMLElement;

    emulatorListContainer.style.display = 'none';
    mainMenu.style.display = "block"
}

async function loadEmulators(): Promise<void> {
  console.log("carroussel open: " + isCarrouselOpen +  " " + "emulator list: " + isEmulatorMenuOpen + " " + "main menu open: " + mainMenuOpen)

  isEmulatorMenuOpen = true
  isCarrouselOpen = false

    showLoading();

    if (emulators.length === 0) {
      const emulatorList = await window.electronAPI.registerEmulator();
      hideLoading()

      if (emulatorList.length === 1 && emulatorList[0].message.includes("não existe")) {
        noContentWarning();
        return;
      }
    }
    
    const carrouselTitle = document.querySelector(".select-game-title") as HTMLElement;

    carrouselTitle.style.display = "none"

    prevButton.style.display = "none"
    nextButton.style.display = "none"

    emulators = await window.electronAPI.getEmulator();

    renderEmulators();

    hideLoading();
}

function renderEmulators(): void {
  if (emulators.length === 0) {
    console.log('Nenhum emulador encontrado.');
    noContentWarning();
    return;
  }

  emulatorListElement.innerHTML = ''; 

  const emulatorContainer = createEmulatorContainer(emulators);

  emulatorListElement.appendChild(emulatorContainer);
}

function createEmulatorContainer(emulators: any): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('game-list-item-container');
  const emulatorList = document.querySelector("#emulator-list-container") as HTMLElement;

  if (!document.getElementById('back-button')) {
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.classList.add('menu-button');
    backButton.textContent = 'Back';
    backButton.tabIndex = 0
    backButton.onclick = () => goBackToMenu();
    emulatorList.appendChild(backButton);
  }

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

  const loadingElement = document.getElementById('loading')!;
  loadingElement.style.display = 'block'; 
  loadingElement.style.opacity = '1';

  emulatorListElement.classList.add('hidden');

  const gameSelector = document.getElementById('game-selector');
  if (gameSelector) {
    gameSelector.style.display = 'block';
    nextButton.style.display = "block";
    prevButton.style.display = "block";
    emulatorListContainerElement.style.display = "none";
  }

  loadGames(emulator.romExtensions);

  if (!isFirstEmulatorSelected) {
    isFirstEmulatorSelected = true;
  }
}

async function loadGames(supportedExtensions: string[]): Promise<void> {
  console.log("carroussel open: " + isCarrouselOpen +  " " + "emulator list: " + isEmulatorMenuOpen + " " + "main menu open: " + mainMenuOpen)

  isCarrouselOpen = true
  try {
    showLoading();

    const carrouselTitle = document.querySelector(".select-game-title") as HTMLElement;

    carrouselTitle.style.display = "block"

    if (games.length === 0) {
      await window.electronAPI.searchAndSaveGames(supportedExtensions)
    }

    games = await window.electronAPI.getGames(supportedExtensions);

    if (games.length === 0) {
      displayNoGamesMessage();
      hideLoading();
      return;
    }

    renderGames();
    hideLoading();

    if (isFirstEmulatorSelected) {
      closeEmulatorMenu();
    }
  } catch (error) {
    console.error('Erro ao carregar jogos:', error);
    hideLoading();
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
  container.setAttribute('tabindex', '0');

  container.addEventListener('focus', () => {
    container.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  });

  container.addEventListener('blur', () => {
    container.classList.remove('focused');
  });

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
const gameListElement = document.getElementById('game-list') as HTMLElement;
const emulatorListElement = document.querySelector('.emulators-list') as HTMLElement;
let emulatorListContainerElement = document.getElementById('emulator-list-container') as HTMLElement;
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

let inputLock = false;
let isButtonAPressed = false;
let isButtonStartPressed = false;
let lastAxisX = 0;
let lastAxisY = 0;
let mainMenuCooldown = false;
let emulatorMenuCooldown = false; 
let carrouselCooldown = false

let isCarrouselOpen = false
let isEmulatorMenuOpen = false;
let isFirstEmulatorSelected = false;

let emulatorIndex = 0;
let buttonsIndex = 0

let mainMenuOpen = true


let mainMenuButtons: HTMLElement[] = [];
let emulatorListButtons: HTMLElement[] = [];

function setMenuState(mainMenu: boolean, emulatorMenu: boolean, carrousel: boolean) {
  mainMenuOpen = mainMenu;
  isEmulatorMenuOpen = emulatorMenu;
  isCarrouselOpen = carrousel;

  const mainMenuElement = document.getElementById('main-menu');
  const emulatorMenuElement = document.getElementById('emulator-list-container');
  const carrouselElement = document.getElementById('game-selector');

  if (!carrouselElement) {
    return;
  }

  if (!mainMenuElement) {
    return;
  }

  if (!emulatorMenuElement) {
    return;
  }

  if (mainMenu && mainMenuButtons.length === 0) {
    mainMenuButtons = Array.from(mainMenuElement!.querySelectorAll(".menu-button"));
  }

  mainMenuElement!.style.display = mainMenu ? 'block' : 'none';
  emulatorMenuElement!.style.display = emulatorMenu ? 'block' : 'none';
  carrouselElement!.style.display = carrousel ? 'block' : 'none';
}

function highlightButton(index: number) {
  if (!mainMenuButtons || mainMenuButtons.length === 0) {
    console.error("No buttons found to highlight.");
    return;
  }

  mainMenuButtons.forEach((mainMenuButton, i) => {
    if (!mainMenuButton) {
      console.error(`Button at index ${i} is null.`);
      return;
    }
    mainMenuButton.classList.toggle('selected', i === index);
  });
}

function mainMenuLoader() {
  setMenuState(true, false, false)

  const emulatorsButton = document.getElementById('emulators-button') as HTMLElement;
  const exitButton = document.getElementById('exit-button') as HTMLElement;
  const mainMenu = document.getElementById('main-menu') as HTMLElement;
  const emulatorListContainer = document.getElementById('emulator-list-container') as HTMLElement;
  const gameSelector = document.getElementById('game-selector') as HTMLElement

  mainMenu.classList.add("visible")
  emulatorListContainer.style.display = "none";
  gameSelector.style.display = "none"

  emulatorsButton.addEventListener('click', async () => {
    loadEmulators();
    mainMenu.style.display = "none"
    emulatorListContainer.style.display = "block"
  });

  exitButton.addEventListener('click', () => {
    window.close();
  });
}

async function noContentCheck() {

  let emulatorList = await window.electronAPI.getLocalEmulator();

  if (emulatorList.length === 0) {
    const registerResponse = await window.electronAPI.registerEmulator();
    
    if (registerResponse.length === 0 || (registerResponse.length === 1 && registerResponse[0].message)) {
      noContentWarning();
      return;
    }

    emulatorList = await window.electronAPI.getLocalEmulator(); 
  }

  emulators = emulatorList;

  if(emulatorList.length >= 1) {
    mainMenuLoader()
  }

}

function noContentWarning(): void {
  hideLoading()
  setMenuState(false, false, false)

  const noContentWarningContainer = document.querySelector("#no-content-warning-container") as HTMLElement;

  nextButton.style.display = "none"
  prevButton.style.display = "none"

  const noContentInfoContainer = document.createElement("div");
  noContentInfoContainer.classList.add("no-content-info-container");

  const noContentButton = document.createElement("button")
  noContentButton.classList.add("no-content-button")
  noContentButton.innerHTML = "Reload"

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

  noContentInfoContainer.appendChild(noContentTitle);
  noContentInfoContainer.appendChild(noContentInfo);
  noContentInfoContainer.appendChild(noContentButton)
  
  noContentWarningContainer.appendChild(noContentInfoContainer);

  noContentWarningContainer.style.display = "block"

  noContentButton.addEventListener("click", async () => {
    let emulatorList = await window.electronAPI.registerEmulator();
    emulatorList = await window.electronAPI.getLocalEmulator();
    const mainMenu = document.getElementById('main-menu') as HTMLElement;
    const emulatorListContainer = document.getElementById('emulator-list-container') as HTMLElement;

    if (emulatorList.length >= 1 && !emulatorList[0].message) {
      noContentWarningContainer.style.display = "none"
      emulatorListContainer.style.display = "block"

      loadEmulators()
    } else {
      setMenuState(false, false, false)
      return
    }
  })
}

function highlightItem(items: HTMLElement[], index: number, className: string = 'selected'): void {
  items.forEach((item, i) => {
    item.classList.toggle(className, i === index);
  });
}

function highlightEmulator(index: number): void {
  highlightItem(emulatorListButtons, index);
}

function highlightMainMenu(index: number): void {
  highlightItem(mainMenuButtons, index);
}

function handleKeyboardNavigation(event: KeyboardEvent): void {
  if (event.key === 'Escape' && !mainMenuOpen) {
    if (isFirstEmulatorSelected) {
      if (isEmulatorMenuOpen) {
        setMenuState(false, false, true);
      } else {
        setMenuState(false, true, false);
      }
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
  const numButtons = mainMenuButtons.length;
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
    currentIndex = (currentIndex - 1 + numButtons) % numButtons;
    highlightMainMenu(currentIndex);
  } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
    currentIndex = (currentIndex + 1) % numButtons;
    highlightMainMenu(currentIndex);
  } else if (event.key === 'Enter') {
    mainMenuButtons[currentIndex].click();
  }
}

function handleEmulatorMenuNavigation(event: KeyboardEvent): void {
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
    emulatorIndex = (emulatorIndex - 1 + emulatorListButtons.length) % emulatorListButtons.length;
    highlightEmulator(emulatorIndex);
  } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
    emulatorIndex = (emulatorIndex + 1) % emulatorListButtons.length;
    highlightEmulator(emulatorIndex);
  } else if (event.key === 'Enter') {
    if (emulatorListButtons[emulatorIndex].id === "back-button") {
      goBackToMenu()
    } else {
      selectEmulator(emulators[emulatorIndex]);
    }
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

function applyCooldown(state: 'mainMenu' | 'emulatorMenu' | 'carrousel', duration: number) {
  if (state === 'mainMenu' && !mainMenuCooldown) mainMenuCooldown = true;
  if (state === 'emulatorMenu' && !emulatorMenuCooldown) emulatorMenuCooldown = true;
  if (state === 'carrousel' && !carrouselCooldown) carrouselCooldown = true;

  setTimeout(() => {
    if (state === 'mainMenu') mainMenuCooldown = false;
    if (state === 'emulatorMenu') emulatorMenuCooldown = false;
    if (state === 'carrousel') carrouselCooldown = false;
  }, duration);
}

function handleGamepadInput(gamepad: Gamepad) {
  if (inputLock) {
    return
  }

  const axisY = gamepad.axes[1];
  const axisX = gamepad.axes[0];
  const buttonAPressed = gamepad.buttons[0].pressed;
  const buttonStartPressed = gamepad.buttons[9].pressed;

  if (buttonStartPressed && !isButtonStartPressed) {
    isButtonStartPressed = true;

    if (!mainMenuOpen) {
      if (isFirstEmulatorSelected) {
        if (isEmulatorMenuOpen) {
          setMenuState(false, false, true);
        } else {
          setMenuState(false, true, false);
        }
      }
    }
  } else if (!buttonStartPressed && isButtonStartPressed) {
    isButtonStartPressed = false;
  }

  if (mainMenuOpen) {
    handleMainMenuInput(axisY, buttonAPressed);
  } else if (isEmulatorMenuOpen) {
    handleEmulatorMenuInput(axisY, buttonAPressed);
  } else if (isCarrouselOpen) {
    handleCarrouselInput(axisX, buttonAPressed);
  }
}

function handleMainMenuInput(axisY: number, buttonAPressed: boolean) {
  if (!mainMenuOpen || mainMenuCooldown) {
    return;
  }

  if (Math.abs(axisY) > 0.2) {
    if (axisY < -0.2) {
      currentIndex = (currentIndex - 1 + mainMenuButtons.length) % mainMenuButtons.length;
      highlightButton(currentIndex);
    } else if (axisY > 0.2) {
      currentIndex = (currentIndex + 1) % mainMenuButtons.length;
      highlightButton(currentIndex);
    }
    applyCooldown('mainMenu', 300);
  }

  if (buttonAPressed && !isButtonAPressed) {
    isButtonAPressed = true;
    mainMenuButtons[currentIndex].click();
  } else if (!buttonAPressed) {
    isButtonAPressed = false;
  }
}

function handleEmulatorMenuInput(axisY: number, buttonAPressed: boolean) {
  if (!isEmulatorMenuOpen || emulatorMenuCooldown) {
    return
  }

  if (Math.abs(axisY) > 0.2 && !emulatorMenuCooldown) { 

    if (axisY < -0.2) { 
      emulatorIndex = (emulatorIndex - 1 + emulatorListButtons.length) % emulatorListButtons.length;
      highlightEmulator(emulatorIndex);
    } else if (axisY > 0.2) { 
      emulatorIndex = (emulatorIndex + 1) % emulatorListButtons.length;
      highlightEmulator(emulatorIndex);
    }
    lastAxisY = axisY;
    applyCooldown("emulatorMenu", 300) 
  }

  
  if (buttonAPressed && !isButtonAPressed) {
    isButtonAPressed = true;
    if (emulatorListButtons[emulatorIndex].id === 'back-button') {
      goBackToMenu();
    } else {
      selectEmulator(emulators[emulatorIndex]);
    }
  } else if (!buttonAPressed) {
    isButtonAPressed = false;
  }
}

function handleCarrouselInput(axisX: number, buttonAPressed: boolean) {
  if (!isCarrouselOpen || carrouselCooldown) {
    return
  }

  if (Math.abs(axisX) > 0.2 && !carrouselCooldown) { 
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
    applyCooldown("carrousel", 300)
  }
  
  if (buttonAPressed && !isButtonAPressed) {
    isButtonAPressed = true;
    startGame();
  } else if (!buttonAPressed) {
    isButtonAPressed = false;
  }
}

function detectGamepad(): void {
  const gamepads = navigator.getGamepads();
  if (!gamepads || gamepads.length === 0) {
    requestAnimationFrame(detectGamepad);
    return;
  }

  const gamepad = gamepads[0];
  if (gamepad && gamepad.connected) {
    handleGamepadInput(gamepad);
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
  noContentCheck()
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
  const loadText = document.querySelector("#loading .load-text") || document.createElement("p");
  loadText.classList.add("load-text");

  if (!mainMenuOpen && isEmulatorMenuOpen && !isCarrouselOpen) {
    loadText.textContent = "Searching emulators";
  } else if (!mainMenuOpen && !isEmulatorMenuOpen && isCarrouselOpen) {
    loadText.textContent = "Searching Games";
  }

  if (!document.querySelector("#loading .load-text")) {
    loadingElement.appendChild(loadText);
  }

  loadingElement.style.display = "flex";
  loadingElement.style.opacity = "1";
  loadingElement.style.pointerEvents = "auto";
}

function hideLoading(): void {
  loadingElement.style.opacity = '0';
  setTimeout(() => {
    loadingElement.style.display = 'none';
  }, 500);
}

function goBackToMenu() {
  mainMenuLoader()
}

async function loadEmulators(): Promise<void> {
  setMenuState(false, true, false);
  showLoading();

  let emulatorList = await window.electronAPI.getLocalEmulator();

  if (emulatorList.length > 0) {
    const newExecutables = await window.electronAPI.checkForNewExecutables();
    if (newExecutables.length > 0) {
      await window.electronAPI.registerNewExecutables(newExecutables);
      emulatorList = await window.electronAPI.getLocalEmulator();
    }
  }

  emulators = emulatorList;

  hideLoading();

  const carrouselTitle = document.querySelector(".select-game-title") as HTMLElement;
  carrouselTitle.style.display = "none";

  prevButton.style.display = "none";
  nextButton.style.display = "none";

  
  renderEmulators();

  hideLoading();
}

function renderEmulators(): void {
  emulatorListElement.innerHTML = ''; 

  const newEmulatorListContainer = createEmulatorContainer(emulators);
  emulatorListContainerElement = newEmulatorListContainer
}

function createEmulatorContainer(emulators: any): HTMLElement {
  const emulatorListContainer = document.getElementById("emulator-list-container") as HTMLElement;
  const emulatorList = document.querySelector(".emulators-list") as HTMLElement

  if (!document.getElementById('back-button')) {
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.classList.add('emulator-menu-button');
    backButton.textContent = 'Back';
    backButton.focus()
    backButton.onclick = () => goBackToMenu();
    emulatorListContainer.appendChild(backButton);
  }

  for (let emulator of emulators) {
    const emulatorTitle = document.createElement('h3');
    emulatorTitle.id = 'emulator-list-item';
    emulatorTitle.classList.add('emulator-menu-button');
    emulatorTitle.textContent = emulator.emulatorName;

    emulatorTitle.onclick = () => selectEmulator(emulator);

    emulatorList.appendChild(emulatorTitle);
  }

  emulatorListButtons = Array.from(document.querySelectorAll(".emulator-menu-button"));

  return emulatorListContainer;
}

function selectEmulator(emulator: any): void {
  setMenuState(false, false, true)

  selectedEmulator = emulator;

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
  setMenuState(false, false, true);
  try {
    showLoading();

    const carrouselTitle = document.querySelector(".select-game-title") as HTMLElement;
    carrouselTitle.style.display = "block";

    games = await window.electronAPI.getGames(supportedExtensions);

    if (games.length === 0) {
      displayNoGamesMessage();
    } else {
      renderGames();
    }

    hideLoading();
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
  if (!currentIndex) {
    currentIndex = 0
  }
  renderGames();
}

function moveToPrevGame(): void {
  currentIndex = (currentIndex - 1 + games.length) % games.length;
  if (!currentIndex) {
    currentIndex = 0
  }

  renderGames();
}

prevButton.addEventListener('click', moveToPrevGame);
nextButton.addEventListener('click', moveToNextGame);
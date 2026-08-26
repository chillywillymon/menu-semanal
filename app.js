/* ==========================================================================
   APP STATE & STORAGE INITIALIZATION (COCINITAS TIME)
   ========================================================================== */

// Default Recipe Database to pre-populate if empty
const DEFAULT_RECIPES = [
  {
    id: "rec_1",
    nombre: "Espaguetis al Pesto Cremoso",
    tipo: "Comida",
    ingredientes: "300g de espaguetis\n50g de hojas de albahaca fresca\n40g de piñones o nueces\n1 diente de ajo\nAceite de oliva virgen extra\n50g de queso parmesano rallado\n1 pizca de sal y pimienta",
    imagen: "images/pasta.png"
  },
  {
    id: "rec_2",
    nombre: "Ensalada César con Pollo Orgánico",
    tipo: "Comida",
    ingredientes: "1 lechuga romana fresca\n1 pechuga de pollo a la plancha\n50g de picatostes crujientes\n50g de queso parmesano en lascas\n3 cucharadas de salsa César (mostaza, miel, limón, aceite)",
    imagen: "images/salad.png"
  },
  {
    id: "rec_3",
    nombre: "Sopa de Calabaza Asada y Semillas",
    tipo: "Cena",
    ingredientes: "600g de calabaza madura\n2 zanahorias grandes\n1 puerro\n1 patata mediana\n2 cucharadas de aceite de oliva\nSemillas de calabaza tostadas\nSal, pimienta y nuez moscada",
    imagen: "images/soup.png"
  },
  {
    id: "rec_4",
    nombre: "Salmón al Horno con Miel y Mostaza",
    tipo: "Cena",
    ingredientes: "2 filetes de salmón fresco\n2 cucharadas de miel de abejas\n1 cucharada de mostaza de Dijon\n1 manojo de espárragos verdes\nMedio limón\nAceite de oliva, sal y pimienta",
    imagen: "images/salmon.png"
  },
  {
    id: "rec_5",
    nombre: "Lentejas Guisadas con Verduras",
    tipo: "Comida",
    ingredientes: "250g de lentejas pardinas\n1 zanahoria en dados\n1 patata en dados\n1 cebolla pequeña\n1 diente de ajo\n1 hoja de laurel\n1 cucharadita de pimentón dulce\nSal y aceite de oliva",
    imagen: "images/soup.png"
  }
];

const DEFAULT_ILLUSTRATIONS = [
  { name: 'Pasta', path: 'images/pasta.png' },
  { name: 'Ensalada', path: 'images/salad.png' },
  { name: 'Sopa', path: 'images/soup.png' },
  { name: 'Salmón', path: 'images/salmon.png' }
];

// App State Object
const state = {
  recipes: [],
  weeklyPlan: [],
  shoppingPurchased: {}, // Structure: { "weekKey": { "ingredient_key": true } }
  currentDate: new Date(),
  activeView: 'semanal',
  hidePurchased: false,
  
  // Temporal state for modals
  activeAssignTarget: null // { dateStr: 'YYYY-MM-DD', mealType: 'comida'|'cena' }
};

// LocalStorage Helper functions
function loadDataFromStorage() {
  // Recipes
  const storedRecipes = localStorage.getItem('cocinitas_recipes');
  if (storedRecipes) {
    state.recipes = JSON.parse(storedRecipes);
  } else {
    state.recipes = [...DEFAULT_RECIPES];
    saveRecipesToStorage();
  }

  // Weekly Plan
  const storedPlan = localStorage.getItem('cocinitas_plan');
  state.weeklyPlan = storedPlan ? JSON.parse(storedPlan) : [];

  // Shopping List Completed States
  const storedShopping = localStorage.getItem('cocinitas_shopping');
  state.shoppingPurchased = storedShopping ? JSON.parse(storedShopping) : {};
  
  // Hide purchased filter state
  const storedHide = localStorage.getItem('cocinitas_hide_purchased');
  state.hidePurchased = storedHide === 'true';
}

function saveRecipesToStorage() {
  localStorage.setItem('cocinitas_recipes', JSON.stringify(state.recipes));
}

function savePlanToStorage() {
  localStorage.setItem('cocinitas_plan', JSON.stringify(state.weeklyPlan));
}

function saveShoppingToStorage() {
  localStorage.setItem('cocinitas_shopping', JSON.stringify(state.shoppingPurchased));
}

function saveSettingsToStorage() {
  localStorage.setItem('cocinitas_hide_purchased', state.hidePurchased);
}


/* ==========================================================================
   DATE & CALENDAR UTILITIES
   ========================================================================== */

// Calculates the ISO 8601 week number and year
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

// Generates an array of Date objects representing the 7 days (Monday-Sunday) of the active week
function getWeekDates(date) {
  const current = new Date(date);
  const day = current.getDay();
  // Adjust Monday offset (getDay() returns 0 for Sunday, 1 for Monday...)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(monday);
    tempDate.setDate(monday.getDate() + i);
    dates.push(tempDate);
  }
  return dates;
}

// Convert Date object to YYYY-MM-DD string, avoiding local timezone offsets
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date nicely in Spanish (e.g., "Lunes, 6 Jul")
function formatNiceDate(date, showYear = false) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  return `${dayName}, ${dayNum} ${monthName}${showYear ? ` ${date.getFullYear()}` : ''}`;
}

// Format full date in Spanish for headings
function formatFullDate(date) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}

// Generates a unique key for the active week, e.g. "2026-W28"
function getWeekKey(date) {
  const { week, year } = getWeekNumber(date);
  return `${year}-W${week}`;
}


/* ==========================================================================
   UI NAVIGATION LOGIC
   ========================================================================== */
function setupNavigation() {
  const navItems = document.querySelectorAll('.mobile-nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      if (targetView) {
        switchView(targetView);
      }
    });
  });

  // Modal Close buttons
  document.getElementById('btn-close-select-meal').addEventListener('click', () => closeModal('modal-select-meal'));
  document.getElementById('btn-close-recipe-form').addEventListener('click', () => closeModal('modal-recipe-form'));
  document.getElementById('btn-cancel-recipe-form').addEventListener('click', () => closeModal('modal-recipe-form'));
  document.getElementById('btn-close-shopping-list').addEventListener('click', () => closeModal('modal-shopping-list'));
  document.getElementById('btn-close-shopping-footer').addEventListener('click', () => closeModal('modal-shopping-list'));
  
  // Shopping list modal trigger
  document.getElementById('mobile-shopping-trigger').addEventListener('click', (e) => {
    e.preventDefault();
    openShoppingModal();
  });

  // Header quick "Today" week button
  document.getElementById('btn-current-week').addEventListener('click', () => {
    state.currentDate = new Date();
    updateWeekDisplay();
    renderActiveView();
  });

  // Week navigation
  document.getElementById('btn-prev-week').addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() - 7);
    updateWeekDisplay();
    renderActiveView();
  });

  document.getElementById('btn-next-week').addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() + 7);
    updateWeekDisplay();
    renderActiveView();
  });

  // Global FAB for recipe form
  document.getElementById('global-add-recipe-fab').addEventListener('click', () => {
    openRecipeFormModal();
  });

  // Header action buttons
  document.getElementById('btn-add-recipe-header').addEventListener('click', () => {
    openRecipeFormModal();
  });

  document.getElementById('btn-download-menu').addEventListener('click', () => {
    downloadMenuAsImage();
  });

  document.getElementById('btn-download-menu-large').addEventListener('click', () => {
    downloadMenuAsImage();
  });

  // Filter tabs in Recetario
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      const searchVal = document.getElementById('recetario-search').value;
      renderRecetarioGrid(filter, searchVal);
    });
  });

  // Search input in Recetario
  document.getElementById('recetario-search').addEventListener('input', (e) => {
    const activeTab = document.querySelector('.filter-tab.active');
    const filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
    renderRecetarioGrid(filter, e.target.value);
  });
}

function switchView(viewName) {
  state.activeView = viewName;
  
  // Toggle sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(`view-${viewName}-section`).classList.remove('hidden');

  // Toggle active class on nav links
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Header modifications based on active view
  const weekPickerHeader = document.getElementById('header-week-picker');
  const btnDownload = document.getElementById('btn-download-menu');
  const btnAddRecipe = document.getElementById('btn-add-recipe-header');
  const fab = document.getElementById('global-add-recipe-fab');

  if (viewName === 'semanal') {
    weekPickerHeader.classList.remove('hidden');
    btnDownload.classList.remove('hidden');
    btnAddRecipe.classList.add('hidden');
    fab.classList.remove('hidden');
    updateWeekDisplay();
  } else if (viewName === 'dia') {
    weekPickerHeader.classList.add('hidden');
    btnDownload.classList.add('hidden');
    btnAddRecipe.classList.add('hidden');
    fab.classList.remove('hidden');
  } else if (viewName === 'recetario') {
    weekPickerHeader.classList.add('hidden');
    btnDownload.classList.add('hidden');
    btnAddRecipe.classList.remove('hidden');
    fab.classList.add('hidden'); // Hide FAB since we have header add button
  }

  renderActiveView();
}

function updateWeekDisplay() {
  const { week, year } = getWeekNumber(state.currentDate);
  const weekDisplay = document.getElementById('week-display-label');
  if (weekDisplay) {
    weekDisplay.textContent = `Semana ${week}, ${year}`;
  }
  
  // Update badge notifications
  updateShoppingBadge();
}

function renderActiveView() {
  if (state.activeView === 'semanal') {
    renderWeeklyPlan();
  } else if (state.activeView === 'dia') {
    renderDayByDay();
  } else if (state.activeView === 'recetario') {
    const activeTab = document.querySelector('.filter-tab.active');
    const filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
    const searchVal = document.getElementById('recetario-search').value;
    renderRecetarioGrid(filter, searchVal);
  }
}


/* ==========================================================================
   MODAL WINDOW CONTROLLER
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}


/* ==========================================================================
   VIEW RENDERERS - 1. VISTA PLAN SEMANAL (TABLERO MÓVIL VERTICAL)
   ========================================================================== */
function renderWeeklyPlan() {
  const kanban = document.getElementById('weekly-kanban-board');
  kanban.innerHTML = '';

  const weekDates = getWeekDates(state.currentDate);
  const todayStr = formatDateToYYYYMMDD(new Date());

  weekDates.forEach(date => {
    const dateStr = formatDateToYYYYMMDD(date);
    const plan = state.weeklyPlan.find(p => p.fecha === dateStr) || { comida_id: null, cena_id: null };
    
    const isToday = dateStr === todayStr;
    const dayClass = isToday ? 'mobile-day-card today' : 'mobile-day-card';
    
    const dayNameStr = formatNiceDate(date).split(',')[0];
    const dayNumberStr = formatNiceDate(date).split(',')[1];
    
    // Find assigned dishes details
    const comidaRecipe = state.recipes.find(r => r.id === plan.comida_id);
    const cenaRecipe = state.recipes.find(r => r.id === plan.cena_id);

    const dayEl = document.createElement('div');
    dayEl.className = dayClass;
    
    dayEl.innerHTML = `
      <div class="mobile-day-header">
        <h4 class="mobile-day-title">${dayNameStr} <span>${dayNumberStr}</span></h4>
        ${isToday ? '<span class="mobile-day-badge-today">Hoy</span>' : ''}
      </div>
      <div class="mobile-day-meals-row">
        <!-- COMIDA -->
        <div class="meal-slot comida">
          <div class="meal-label"><i class="ph-fill ph-sun"></i> Almuerzo</div>
          ${comidaRecipe ? renderMealCardHtml(comidaRecipe, dateStr, 'Comida') : renderEmptyMealBtnHtml(dateStr, 'Comida')}
        </div>
        <!-- CENA -->
        <div class="meal-slot cena">
          <div class="meal-label"><i class="ph-fill ph-moon"></i> Cena</div>
          ${cenaRecipe ? renderMealCardHtml(cenaRecipe, dateStr, 'Cena') : renderEmptyMealBtnHtml(dateStr, 'Cena')}
        </div>
      </div>
    `;

    kanban.appendChild(dayEl);
  });

  // Bind click handlers to newly created meal slots
  setupMealCardEvents();
}

function renderMealCardHtml(recipe, dateStr, mealType) {
  return `
    <div class="filled-meal-card" data-date="${dateStr}" data-meal="${mealType}">
      <div class="meal-img-wrapper">
        <img class="meal-img" src="${recipe.imagen || 'images/soup.png'}" alt="${recipe.nombre}">
        <button class="btn-remove-meal-slot" data-date="${dateStr}" data-meal="${mealType}" title="Quitar plato">
          <i class="ph ph-trash"></i>
        </button>
      </div>
      <div class="meal-card-info">
        <div class="meal-title" title="${recipe.nombre}">${recipe.nombre}</div>
      </div>
    </div>
  `;
}

function renderEmptyMealBtnHtml(dateStr, mealType) {
  return `
    <button class="empty-meal-btn" data-date="${dateStr}" data-meal="${mealType}">
      <i class="ph ph-plus"></i>
      <span>Añadir</span>
    </button>
  `;
}

function setupMealCardEvents() {
  const triggers = document.querySelectorAll('.empty-meal-btn, .filled-meal-card');
  triggers.forEach(el => {
    el.addEventListener('click', () => {
      const dateStr = el.getAttribute('data-date');
      const mealType = el.getAttribute('data-meal');
      openSelectMealModal(dateStr, mealType);
    });
  });

  // Bind quick remove button events
  document.querySelectorAll('.btn-remove-meal-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid opening the select meal modal
      const dateStr = btn.getAttribute('data-date');
      const mealType = btn.getAttribute('data-meal');
      removeMealFromPlan(dateStr, mealType);
    });
  });
}


/* ==========================================================================
   VIEW RENDERERS - 2. VISTA DÍA A DÍA (3 DÍAS CONSECUTIVOS)
   ========================================================================== */
function renderDayByDay() {
  const container = document.getElementById('day-by-day-list');
  container.innerHTML = '';

  const today = new Date();
  const daysToShow = [];
  
  // Gather Today, Tomorrow, and Day After Tomorrow
  for (let i = 0; i < 3; i++) {
    const tempDate = new Date(today);
    tempDate.setDate(today.getDate() + i);
    daysToShow.push(tempDate);
  }

  daysToShow.forEach((date, index) => {
    const dateStr = formatDateToYYYYMMDD(date);
    const plan = state.weeklyPlan.find(p => p.fecha === dateStr) || { comida_id: null, cena_id: null };
    const isToday = index === 0;
    
    const comidaRecipe = state.recipes.find(r => r.id === plan.comida_id);
    const cenaRecipe = state.recipes.find(r => r.id === plan.cena_id);
    
    const labelTitle = isToday ? "Hoy" : (index === 1 ? "Mañana" : "Pasado Mañana");
    const niceDate = formatNiceDate(date, true).split(',')[1];

    const cardEl = document.createElement('div');
    cardEl.className = `day-detail-card ${isToday ? 'is-today' : ''}`;
    
    // Generate meal column contents
    let comidaHtml = '';
    let cenaHtml = '';

    // Food Render
    if (comidaRecipe) {
      const ingredientsList = comidaRecipe.ingredientes.split('\n')
        .map(ing => `<li>${escapeHtml(ing)}</li>`).join('');
      
      comidaHtml = `
        <div class="detail-meal-item">
          <div class="detail-meal-banner">
            <img src="${comidaRecipe.imagen}" alt="${comidaRecipe.nombre}">
          </div>
          <div class="detail-meal-body">
            <div class="detail-meal-badge-type comida"><i class="ph-fill ph-sun"></i> Almuerzo</div>
            <h4 class="detail-meal-title">${comidaRecipe.nombre}</h4>
            <div class="detail-ingredients-title">Ingredientes:</div>
            <ul class="detail-ingredients-list">
              ${ingredientsList}
            </ul>
          </div>
        </div>
      `;
    } else {
      comidaHtml = `
        <div class="detail-meal-item">
          <div class="detail-empty-state" onclick="switchView('semanal')">
            <i class="ph ph-cooking-pot"></i>
            <p>Almuerzo no planificado</p>
          </div>
        </div>
      `;
    }

    // Dinner Render
    if (cenaRecipe) {
      const ingredientsList = cenaRecipe.ingredientes.split('\n')
        .map(ing => `<li>${escapeHtml(ing)}</li>`).join('');
      
      cenaHtml = `
        <div class="detail-meal-item">
          <div class="detail-meal-banner">
            <img src="${cenaRecipe.imagen}" alt="${cenaRecipe.nombre}">
          </div>
          <div class="detail-meal-body">
            <div class="detail-meal-badge-type cena"><i class="ph-fill ph-moon"></i> Cena</div>
            <h4 class="detail-meal-title">${cenaRecipe.nombre}</h4>
            <div class="detail-ingredients-title">Ingredientes:</div>
            <ul class="detail-ingredients-list">
              ${ingredientsList}
            </ul>
          </div>
        </div>
      `;
    } else {
      cenaHtml = `
        <div class="detail-meal-item">
          <div class="detail-empty-state" onclick="switchView('semanal')">
            <i class="ph ph-cooking-pot"></i>
            <p>Cena no planificada</p>
          </div>
        </div>
      `;
    }

    cardEl.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">
          <h3>${labelTitle} <span>${niceDate}</span></h3>
        </div>
      </div>
      <div class="detail-meals-column">
        ${comidaHtml}
        ${cenaHtml}
      </div>
    `;

    container.appendChild(cardEl);
  });
}


/* ==========================================================================
   VIEW RENDERERS - 3. VISTA RECETARIO (GALERIA)
   ========================================================================== */
function renderRecetarioGrid(filter = 'all', query = '') {
  const grid = document.getElementById('recetario-recipe-grid');
  grid.innerHTML = '';

  let filteredRecipes = state.recipes;
  
  // Filter by Type
  if (filter !== 'all') {
    filteredRecipes = filteredRecipes.filter(r => r.tipo === filter);
  }

  // Filter by search Query
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filteredRecipes = filteredRecipes.filter(r => 
      r.nombre.toLowerCase().includes(q) || 
      r.ingredientes.toLowerCase().includes(q)
    );
  }

  if (filteredRecipes.length === 0) {
    grid.innerHTML = `
      <div class="recipe-select-empty" style="padding: 40px 0;">
        <i class="ph ph-magnifying-glass" style="font-size: 2.5rem; color: var(--color-text-light); margin-bottom: 8px; display:block;"></i>
        <p>No se encontraron platos.</p>
      </div>
    `;
    return;
  }

  filteredRecipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    // Clean ingredients preview list
    const ingredientsPreview = recipe.ingredientes.split('\n')
      .map(ing => ing.trim())
      .filter(Boolean)
      .join(', ');

    card.innerHTML = `
      <div class="recipe-card-img-wrapper">
        <img class="recipe-card-img" src="${recipe.imagen}" alt="${recipe.nombre}">
        <span class="recipe-badge-type ${recipe.tipo.toLowerCase()}">${recipe.tipo}</span>
      </div>
      <div class="recipe-card-content">
        <h4 class="recipe-card-title">${recipe.nombre}</h4>
        <p class="recipe-card-ingredients">${escapeHtml(ingredientsPreview)}</p>
        <div class="recipe-card-actions">
          <button class="btn btn-secondary btn-sm btn-edit-recipe" data-id="${recipe.id}">
            <i class="ph ph-pencil-simple"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-delete-recipe" data-id="${recipe.id}">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Bind edit/delete events
  setupRecipeCrudEvents();
}

function setupRecipeCrudEvents() {
  document.querySelectorAll('.btn-edit-recipe').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openRecipeFormModal(id);
    });
  });

  document.querySelectorAll('.btn-delete-recipe').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      confirmAndDeleteRecipe(id);
    });
  });
}


/* ==========================================================================
   MODAL CONTROLLER - SELECT / ASSIGN MEAL RECIPE
   ========================================================================== */
function openSelectMealModal(dateStr, mealType) {
  state.activeAssignTarget = { dateStr, mealType };
  
  // Set Modal title
  const dateObj = new Date(dateStr + 'T00:00:00'); // prevent timezone offset shifting
  document.getElementById('select-meal-title').textContent = `${mealType === 'Comida' ? 'Almuerzo' : 'Cena'} del ${formatNiceDate(dateObj).split(',')[0]}`;

  // Clear search field
  const searchInput = document.getElementById('select-meal-search');
  searchInput.value = '';

  // Get active plan if exists
  const plan = state.weeklyPlan.find(p => p.fecha === dateStr);
  const currentAssignedId = plan ? (mealType === 'Comida' ? plan.comida_id : plan.cena_id) : null;

  renderSelectMealOptions(currentAssignedId);

  // Setup live search inside selection list
  searchInput.oninput = (e) => {
    renderSelectMealOptions(currentAssignedId, e.target.value);
  };

  // Setup "Quitar" button visibility & functionality
  const unlinkBtn = document.getElementById('btn-unlink-meal');
  if (currentAssignedId) {
    unlinkBtn.classList.remove('hidden');
    unlinkBtn.onclick = () => {
      removeMealFromPlan(dateStr, mealType);
      closeModal('modal-select-meal');
    };
  } else {
    unlinkBtn.classList.add('hidden');
  }

  // Setup "Crear Plato" inside selector
  document.getElementById('btn-create-new-recipe-from-select').onclick = () => {
    closeModal('modal-select-meal');
    openRecipeFormModal(null, mealType);
  };

  openModal('modal-select-meal');
}

function renderSelectMealOptions(currentAssignedId, query = '') {
  const container = document.getElementById('select-meal-options');
  container.innerHTML = '';

  const mealType = state.activeAssignTarget.mealType;
  
  // Highlight/Filter recipes of this specific type first, then others
  let filtered = state.recipes.filter(r => r.tipo === mealType);
  let secondary = state.recipes.filter(r => r.tipo !== mealType);

  // Combine both lists
  let list = [...filtered, ...secondary];

  // Apply search query filter if any
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(r => r.nombre.toLowerCase().includes(q));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="recipe-select-empty">
        <p>No se encontraron platos.</p>
      </div>
    `;
    return;
  }

  list.forEach(recipe => {
    const isSelected = recipe.id === currentAssignedId;
    const isRecommendedType = recipe.tipo === mealType;
    
    const itemEl = document.createElement('div');
    itemEl.className = `recipe-select-item ${isSelected ? 'selected' : ''}`;
    
    itemEl.innerHTML = `
      <img class="recipe-select-img" src="${recipe.imagen}" alt="${recipe.nombre}">
      <div class="recipe-select-info">
        <div class="recipe-select-name">${recipe.nombre}</div>
        <span class="recipe-select-type ${recipe.tipo.toLowerCase()}">
          ${recipe.tipo === 'Comida' ? 'Almuerzo' : 'Cena'} ${isRecommendedType ? '(Recomendado)' : ''}
        </span>
      </div>
      <i class="ph ph-check-circle-fill recipe-select-tick"></i>
    `;

    itemEl.onclick = () => {
      assignMealToPlan(state.activeAssignTarget.dateStr, state.activeAssignTarget.mealType, recipe.id);
      closeModal('modal-select-meal');
    };

    container.appendChild(itemEl);
  });
}

function assignMealToPlan(dateStr, mealType, recipeId) {
  let planIndex = state.weeklyPlan.findIndex(p => p.fecha === dateStr);
  
  // Calculate ISO week details
  const dateObj = new Date(dateStr + 'T00:00:00');
  const { week, year } = getWeekNumber(dateObj);

  if (planIndex !== -1) {
    if (mealType === 'Comida') {
      state.weeklyPlan[planIndex].comida_id = recipeId;
    } else {
      state.weeklyPlan[planIndex].cena_id = recipeId;
    }
  } else {
    const newPlan = {
      fecha: dateStr,
      semana: week,
      anio: year,
      comida_id: mealType === 'Comida' ? recipeId : null,
      cena_id: mealType === 'Cena' ? recipeId : null
    };
    state.weeklyPlan.push(newPlan);
  }

  savePlanToStorage();
  renderActiveView();
  updateShoppingBadge();
}

function removeMealFromPlan(dateStr, mealType) {
  let planIndex = state.weeklyPlan.findIndex(p => p.fecha === dateStr);
  if (planIndex !== -1) {
    if (mealType === 'Comida') {
      state.weeklyPlan[planIndex].comida_id = null;
    } else {
      state.weeklyPlan[planIndex].cena_id = null;
    }
    
    // Clean up empty plans
    if (!state.weeklyPlan[planIndex].comida_id && !state.weeklyPlan[planIndex].cena_id) {
      state.weeklyPlan.splice(planIndex, 1);
    }
    
    savePlanToStorage();
    renderActiveView();
    updateShoppingBadge();
  }
}


/* ==========================================================================
   MODAL CONTROLLER - ADD / EDIT RECIPE FORM
   ========================================================================== */
function openRecipeFormModal(recipeId = null, preSelectedType = null) {
  const form = document.getElementById('recipe-form');
  form.reset();

  const titleEl = document.getElementById('recipe-form-title');
  const idInput = document.getElementById('recipe-form-id');
  const urlInputContainer = document.getElementById('image-custom-url-container');
  urlInputContainer.classList.add('hidden');

  if (recipeId) {
    // EDIT MODE
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    titleEl.textContent = "Editar Receta";
    idInput.value = recipe.id;
    document.getElementById('recipe-name').value = recipe.nombre;
    
    // Set radio type
    const radios = document.getElementsByName('recipe-type');
    radios.forEach(r => {
      r.checked = r.value === recipe.tipo;
    });

    document.getElementById('recipe-ingredients').value = recipe.ingredientes;
    
    // Setup image selection
    renderFormImageSelection(recipe.imagen);
  } else {
    // ADD NEW MODE
    titleEl.textContent = "Nueva Receta";
    idInput.value = '';
    
    // Pre-select type if triggered from plan selector
    if (preSelectedType) {
      const radios = document.getElementsByName('recipe-type');
      radios.forEach(r => {
        r.checked = r.value === preSelectedType;
      });
    }

    renderFormImageSelection();
  }

  // Handle form submit
  form.onsubmit = (e) => {
    e.preventDefault();
    saveRecipeFormSubmit();
  };

  openModal('modal-recipe-form');
}

function renderFormImageSelection(selectedImagePath = '') {
  const grid = document.getElementById('image-selection-grid');
  grid.innerHTML = '';

  // 1. Render default illustrations cards
  DEFAULT_ILLUSTRATIONS.forEach(illustration => {
    const isChecked = selectedImagePath === illustration.path || (!selectedImagePath && illustration.name === 'Pasta');
    const card = document.createElement('label');
    card.className = `image-selection-card ${isChecked ? 'selected' : ''}`;
    
    card.innerHTML = `
      <input type="radio" name="form-image-opt" value="${illustration.path}" ${isChecked ? 'checked' : ''}>
      <img src="${illustration.path}" alt="${illustration.name}">
      <div class="selected-tick"><i class="ph ph-check"></i></div>
    `;

    card.querySelector('input').addEventListener('change', () => {
      document.querySelectorAll('.image-selection-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('image-custom-url-container').classList.add('hidden');
      document.getElementById('recipe-image-url').value = ''; // Clear custom input to prevent validation bugs
    });

    grid.appendChild(card);
  });

  // 2. Render "Custom URL" button card
  const isCustomSelected = selectedImagePath && !DEFAULT_ILLUSTRATIONS.some(i => i.path === selectedImagePath);
  const customCard = document.createElement('label');
  customCard.className = `image-selection-card is-custom-trigger ${isCustomSelected ? 'selected' : ''}`;
  
  customCard.innerHTML = `
    <input type="radio" name="form-image-opt" value="custom" ${isCustomSelected ? 'checked' : ''}>
    <i class="ph ph-globe"></i>
    <span>Internet</span>
    <div class="selected-tick"><i class="ph ph-check"></i></div>
  `;

  const urlInputContainer = document.getElementById('image-custom-url-container');
  const customUrlInput = document.getElementById('recipe-image-url');

  if (isCustomSelected) {
    urlInputContainer.classList.remove('hidden');
    customUrlInput.value = selectedImagePath;
  } else {
    customUrlInput.value = '';
  }

  customCard.querySelector('input').addEventListener('change', () => {
    document.querySelectorAll('.image-selection-card').forEach(c => c.classList.remove('selected'));
    customCard.classList.add('selected');
    urlInputContainer.classList.remove('hidden');
    customUrlInput.focus();
  });

  grid.appendChild(customCard);
}

function saveRecipeFormSubmit() {
  const id = document.getElementById('recipe-form-id').value;
  const nombre = document.getElementById('recipe-name').value.trim();
  const ingredientes = document.getElementById('recipe-ingredients').value.trim();
  
  // Get active type radio
  const typeRadios = document.getElementsByName('recipe-type');
  let tipo = "Comida";
  typeRadios.forEach(r => {
    if (r.checked) tipo = r.value;
  });

  // Get active image radio
  const imageRadios = document.getElementsByName('form-image-opt');
  let imageVal = '';
  imageRadios.forEach(r => {
    if (r.checked) imageVal = r.value;
  });

  if (imageVal === 'custom') {
    const customUrl = document.getElementById('recipe-image-url').value.trim();
    // Default placeholder fallback if custom image is empty
    imageVal = customUrl || "images/soup.png";
  }

  if (id) {
    // Update existing recipe
    const index = state.recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      state.recipes[index] = {
        ...state.recipes[index],
        nombre,
        tipo,
        ingredientes,
        imagen: imageVal
      };
    }
  } else {
    // Add new recipe
    const newRecipe = {
      id: "rec_" + Date.now().toString(36),
      nombre,
      tipo,
      ingredientes,
      imagen: imageVal
    };
    state.recipes.push(newRecipe);
  }

  saveRecipesToStorage();
  closeModal('modal-recipe-form');
  
  // Refresh layout
  renderActiveView();
  
  // If we came from meal selector form, we should trigger reopen select meal dialog
  if (state.activeAssignTarget && !id) {
    openSelectMealModal(state.activeAssignTarget.dateStr, state.activeAssignTarget.mealType);
  }
}

function confirmAndDeleteRecipe(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  const isAssigned = state.weeklyPlan.some(p => p.comida_id === recipeId || p.cena_id === recipeId);
  
  let confirmMessage = `¿Eliminar "${recipe.nombre}"?`;
  if (isAssigned) {
    confirmMessage += `\n\nEstá programada en tu menú semanal. Se quitará de las fechas planificadas.`;
  }

  if (confirm(confirmMessage)) {
    // Remove from recipes list
    state.recipes = state.recipes.filter(r => r.id !== recipeId);
    saveRecipesToStorage();

    // Clean up meal plans referencing this recipe
    if (isAssigned) {
      state.weeklyPlan.forEach((plan, index) => {
        if (plan.comida_id === recipeId) plan.comida_id = null;
        if (plan.cena_id === recipeId) plan.cena_id = null;
        
        // Remove empty plan objects
        if (!plan.comida_id && !plan.cena_id) {
          state.weeklyPlan.splice(index, 1);
        }
      });
      savePlanToStorage();
    }

    renderActiveView();
    updateShoppingBadge();
  }
}


/* ==========================================================================
   AUTOMATION: SHOPPING LIST GENERATOR & MODAL CONTROLLER
   ========================================================================== */
function openShoppingModal() {
  const { week, year } = getWeekNumber(state.currentDate);
  document.getElementById('shopping-list-week-label').textContent = `Semana ${week}, ${year}`;

  renderShoppingListContent();

  // Setup toolbar handlers
  const toggleBtn = document.getElementById('btn-toggle-purchased');
  const toggleIcon = document.getElementById('toggle-purchased-icon');
  const toggleText = document.getElementById('toggle-purchased-text');
  
  const updateToggleBtnState = () => {
    if (state.hidePurchased) {
      toggleIcon.className = 'ph ph-eye';
      toggleText.textContent = 'Mostrar';
    } else {
      toggleIcon.className = 'ph ph-eye-closed';
      toggleText.textContent = 'Ocultar';
    }
  };

  updateToggleBtnState();

  toggleBtn.onclick = () => {
    state.hidePurchased = !state.hidePurchased;
    saveSettingsToStorage();
    updateToggleBtnState();
    
    // Apply hidden animation classes
    document.querySelectorAll('.shopping-item.bought').forEach(el => {
      if (state.hidePurchased) {
        el.classList.add('hidden-bought');
      } else {
        el.classList.remove('hidden-bought');
      }
    });
  };

  // Copy list to Clipboard
  document.getElementById('btn-copy-shopping').onclick = () => {
    copyShoppingListToClipboard();
  };

  // Clear/Reset all purchased items
  document.getElementById('btn-clear-purchased').onclick = () => {
    if (confirm('¿Desmarcar todos los ingredientes comprados de esta semana?')) {
      const weekKey = getWeekKey(state.currentDate);
      state.shoppingPurchased[weekKey] = {};
      saveShoppingToStorage();
      renderShoppingListContent();
      updateShoppingBadge();
    }
  };

  openModal('modal-shopping-list');
}

// Aggregates and returns unique list of ingredients for the active week
function getWeeklyIngredientsList() {
  const weekDates = getWeekDates(state.currentDate);
  const weekDatesStr = weekDates.map(d => formatDateToYYYYMMDD(d));
  
  // Find all plans inside selected week dates
  const plansForThisWeek = state.weeklyPlan.filter(p => weekDatesStr.includes(p.fecha));
  
  const ingredientsMap = {};

  plansForThisWeek.forEach(plan => {
    ['comida_id', 'cena_id'].forEach(mealKey => {
      const recipeId = plan[mealKey];
      if (recipeId) {
        const recipe = state.recipes.find(r => r.id === recipeId);
        if (recipe && recipe.ingredientes) {
          const lines = recipe.ingredientes.split('\n');
          lines.forEach(line => {
            const cleaned = line.replace(/^[\s•\-\*]+/, '').trim();
            if (cleaned) {
              const key = cleaned.toLowerCase();
              if (!ingredientsMap[key]) {
                ingredientsMap[key] = {
                  originalName: cleaned, // Store clean formatted text
                  count: 1
                };
              } else {
                ingredientsMap[key].count++;
              }
            }
          });
        }
      }
    });
  });

  return Object.values(ingredientsMap);
}

function renderShoppingListContent() {
  const container = document.getElementById('shopping-list-content');
  container.innerHTML = '';

  const ingredients = getWeeklyIngredientsList();
  const weekKey = getWeekKey(state.currentDate);
  
  // Initialize shopping week object if missing
  if (!state.shoppingPurchased[weekKey]) {
    state.shoppingPurchased[weekKey] = {};
  }

  if (ingredients.length === 0) {
    container.innerHTML = `
      <div class="shopping-empty-state">
        <i class="ph ph-shopping-bag"></i>
        <p>No hay platos planificados.</p>
        <span class="text-muted text-sm">Añade platos para generar la lista de la compra.</span>
      </div>
    `;
    document.getElementById('shopping-summary-text').textContent = '0 comprados de 0';
    return;
  }

  let boughtCount = 0;

  ingredients.forEach(item => {
    const itemKey = item.originalName.toLowerCase();
    const isBought = !!state.shoppingPurchased[weekKey][itemKey];
    if (isBought) boughtCount++;

    const itemEl = document.createElement('div');
    itemEl.className = `shopping-item ${isBought ? 'bought' : ''} ${isBought && state.hidePurchased ? 'hidden-bought' : ''}`;
    
    itemEl.innerHTML = `
      <div class="shopping-checkbox">
        <i class="ph ph-check"></i>
      </div>
      <span class="shopping-item-name">${escapeHtml(item.originalName)}</span>
    `;

    itemEl.onclick = () => {
      toggleIngredientBoughtState(itemKey);
    };

    container.appendChild(itemEl);
  });

  // Update footer statistics
  document.getElementById('shopping-summary-text').textContent = `${boughtCount} comprados de ${ingredients.length}`;
}

function toggleIngredientBoughtState(itemKey) {
  const weekKey = getWeekKey(state.currentDate);
  if (!state.shoppingPurchased[weekKey]) {
    state.shoppingPurchased[weekKey] = {};
  }

  const currentState = !!state.shoppingPurchased[weekKey][itemKey];
  state.shoppingPurchased[weekKey][itemKey] = !currentState;

  saveShoppingToStorage();
  
  // Re-render and count
  renderShoppingListContent();
  updateShoppingBadge();
}

function updateShoppingBadge() {
  const ingredients = getWeeklyIngredientsList();
  const weekKey = getWeekKey(state.currentDate);
  
  let pendingCount = 0;
  if (ingredients.length > 0) {
    const weekBought = state.shoppingPurchased[weekKey] || {};
    ingredients.forEach(item => {
      const itemKey = item.originalName.toLowerCase();
      if (!weekBought[itemKey]) {
        pendingCount++;
      }
    });
  }

  // Update UI Elements
  const badgeMobile = document.getElementById('mobile-shopping-badge');
  if (badgeMobile) badgeMobile.textContent = pendingCount;
}

function copyShoppingListToClipboard() {
  const { week, year } = getWeekNumber(state.currentDate);
  const ingredients = getWeeklyIngredientsList();
  const weekKey = getWeekKey(state.currentDate);
  const weekBought = state.shoppingPurchased[weekKey] || {};

  if (ingredients.length === 0) {
    alert('No hay ingredientes para copiar.');
    return;
  }

  let text = `🛒 *COMPRA — SEMANA ${week}, ${year}*\n`;
  text += `Generada por Cocinitas Time\n`;
  text += `-------------------------------------------\n\n`;

  let pendingText = `*Pendientes:*\n`;
  let completedText = `\n*Comprados:*\n`;
  
  let hasPending = false;
  let hasCompleted = false;

  ingredients.forEach(item => {
    const itemKey = item.originalName.toLowerCase();
    const isBought = !!weekBought[itemKey];
    
    if (isBought) {
      completedText += `~[x] ${item.originalName}~\n`;
      hasCompleted = true;
    } else {
      pendingText += `[ ] ${item.originalName}\n`;
      hasPending = true;
    }
  });

  let fullCopyText = text;
  if (hasPending) fullCopyText += pendingText;
  if (hasCompleted) fullCopyText += completedText;

  navigator.clipboard.writeText(fullCopyText)
    .then(() => {
      alert('¡Lista de la compra copiada! Lista para compartir.');
    })
    .catch(err => {
      console.error('Error al copiar: ', err);
      alert('Error al copiar la lista.');
    });
}


/* ==========================================================================
   FEATURE: DOWNLOAD WEEKLY MENU AS PNG IMAGE (Cocinitas Time Shareable Poster)
   ========================================================================== */
function downloadMenuAsImage() {
  const { week, year } = getWeekNumber(state.currentDate);
  const weekDates = getWeekDates(state.currentDate);
  
  const mondayDateStr = formatNiceDate(weekDates[0]);
  const sundayDateStr = formatNiceDate(weekDates[6]);
  
  // 1. Build the dynamic off-screen HTML representation of the poster
  const holder = document.getElementById('share-poster-holder');
  holder.innerHTML = ''; // Clear previous

  const poster = document.createElement('div');
  poster.className = 'share-poster';
  
  // Generate rows for each day
  let dayRowsHtml = '';
  weekDates.forEach(date => {
    const dateStr = formatDateToYYYYMMDD(date);
    const plan = state.weeklyPlan.find(p => p.fecha === dateStr) || { comida_id: null, cena_id: null };
    
    const comidaRecipe = state.recipes.find(r => r.id === plan.comida_id);
    const cenaRecipe = state.recipes.find(r => r.id === plan.cena_id);
    
    const dayName = formatNiceDate(date).split(',')[0];
    
    dayRowsHtml += `
      <div class="poster-day-row">
        <div class="poster-day-name">${dayName}</div>
        <div class="poster-day-meals">
          <div class="poster-meal-line">
            <strong>Almuerzo</strong>
            <span class="poster-meal-name ${!comidaRecipe ? 'empty' : ''}">
              ${comidaRecipe ? escapeHtml(comidaRecipe.nombre) : 'No planificado'}
            </span>
          </div>
          <div class="poster-meal-line">
            <strong>Cena</strong>
            <span class="poster-meal-name ${!cenaRecipe ? 'empty' : ''}">
              ${cenaRecipe ? escapeHtml(cenaRecipe.nombre) : 'No planificado'}
            </span>
          </div>
        </div>
      </div>
    `;
  });

  poster.innerHTML = `
    <div class="poster-header">
      <div class="poster-brand">
        <i class="ph-fill ph-cooking-pot"></i>
        <h1>Cocinitas Time</h1>
      </div>
      <div class="poster-week-label">
        Menú de la Semana ${week}, ${year}
        <br>
        <span style="font-size: 0.78rem; text-transform: none; font-weight: 500;">
          del ${mondayDateStr.split(',')[1]} al ${sundayDateStr.split(',')[1]}
        </span>
      </div>
    </div>
    
    <div class="poster-body">
      ${dayRowsHtml}
    </div>
    
    <div class="poster-footer">
      Planificado con amor en Cocinitas Time
    </div>
  `;

  holder.appendChild(poster);

  // 2. Render this element using html2canvas
  // We use scale: 2 for a crisp high-res image (ideal for sending over WhatsApp)
  html2canvas(poster, {
    scale: 2.5,
    backgroundColor: '#FFFFFF',
    logging: false
  }).then(canvas => {
    // 3. Export as image download
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `menu_semana_${week}_${year}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Error al generar la imagen. Inténtalo de nuevo.');
    } finally {
      // Clean up holder
      holder.innerHTML = '';
    }
  });
}


/* ==========================================================================
   UTILITY HELPER FUNCTIONS
   ========================================================================== */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}


/* ==========================================================================
   APP START / INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Load data
  loadDataFromStorage();
  
  // Setup Navigation event listeners
  setupNavigation();
  
  // Set current week display labels
  updateWeekDisplay();

  // Draw active page layout
  renderActiveView();
});

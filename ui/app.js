const dictionaryInput = document.getElementById('dictionary-input');
const dictionaryStatus = document.getElementById('dictionary-status');
const queryInput = document.getElementById('query-input');
const limitInput = document.getElementById('limit-input');
const searchButton = document.getElementById('search-button');
const queryError = document.getElementById('query-error');
const resultsList = document.getElementById('results-list');
const resultsMeta = document.getElementById('results-meta');
const emptyState = document.getElementById('empty-state');

const DEBOUNCE_MS = 280;

/** @type {string[]} */
let words = [];
let debounceTimer = null;
let requestId = 0;

function setDictionaryStatus(text, variant = 'muted') {
  dictionaryStatus.textContent = text;
  dictionaryStatus.className = `status status--${variant}`;
}

function setSearchEnabled(enabled) {
  queryInput.disabled = !enabled;
  searchButton.disabled = !enabled;
}

function hideQueryError() {
  queryError.hidden = true;
  queryError.textContent = '';
}

function showQueryError(message) {
  queryError.hidden = false;
  queryError.textContent = message;
}

function clearResults(message) {
  resultsList.replaceChildren();
  resultsMeta.textContent = '';
  emptyState.hidden = false;
  emptyState.textContent = message;
}

function renderSuggestions(suggestions) {
  resultsList.replaceChildren();

  if (suggestions.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = 'Aucune suggestion trouvée pour cette recherche.';
    resultsMeta.textContent = '0 résultat';
    return;
  }

  emptyState.hidden = true;
  resultsMeta.textContent =
    suggestions.length === 1 ? '1 résultat' : `${suggestions.length} résultats`;

  for (const [index, term] of suggestions.entries()) {
    const item = document.createElement('li');

    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = String(index + 1);

    const label = document.createElement('span');
    label.className = 'term';
    label.textContent = term;

    item.append(rank, label);
    resultsList.append(item);
  }
}

function getLimit() {
  const value = Number(limitInput.value);
  return Number.isFinite(value) && value >= 0 ? value : 10;
}

async function loadDictionary(file) {
  setDictionaryStatus('Chargement du dico…', 'loading');
  setSearchEnabled(false);
  words = [];
  hideQueryError();
  clearResults('Chargement du dictionnaire…');

  const content = await file.text();
  const response = await fetch('/api/dictionary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  const payload = await response.json();
  if (!response.ok) {
    setDictionaryStatus(payload.error ?? 'Erreur de chargement.', 'error');
    clearResults('Impossible de charger le dictionnaire.');
    return;
  }

  words = payload.words;
  setDictionaryStatus(
    `${payload.count.toLocaleString('fr-FR')} mot${payload.count > 1 ? 's' : ''} chargé${payload.count > 1 ? 's' : ''}`,
    'ready',
  );
  setSearchEnabled(true);
  clearResults('Saisissez un mot pour afficher des suggestions.');

  if (queryInput.value.trim()) {
    await fetchSuggestions();
  }
}

async function fetchSuggestions() {
  const currentRequest = ++requestId;
  const query = queryInput.value.trim();
  hideQueryError();

  if (!words.length) {
    clearResults('Chargez un dictionnaire pour commencer.');
    return;
  }

  if (!query) {
    clearResults('Saisissez un mot pour afficher des suggestions.');
    return;
  }

  const response = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      words,
      limit: getLimit(),
    }),
  });

  if (currentRequest !== requestId) {
    return;
  }

  const payload = await response.json();

  if (!response.ok) {
    showQueryError(payload.error ?? 'Requête invalide.');
    clearResults('Corrigez la saisie pour relancer la recherche.');
    return;
  }

  renderSuggestions(payload.suggestions);
}

function scheduleSuggestions() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    void fetchSuggestions();
  }, DEBOUNCE_MS);
}

dictionaryInput.addEventListener('change', () => {
  const file = dictionaryInput.files?.[0];
  if (!file) {
    words = [];
    setDictionaryStatus('Aucun dictionnaire chargé', 'muted');
    setSearchEnabled(false);
    hideQueryError();
    clearResults('Chargez un dictionnaire pour commencer.');
    return;
  }

  void loadDictionary(file);
});

queryInput.addEventListener('input', () => {
  hideQueryError();
  scheduleSuggestions();
});

queryInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    void fetchSuggestions();
  }
});

limitInput.addEventListener('change', () => {
  if (queryInput.value.trim() && words.length) {
    void fetchSuggestions();
  }
});

searchButton.addEventListener('click', () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  void fetchSuggestions();
});

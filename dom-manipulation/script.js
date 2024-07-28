document.addEventListener('DOMContentLoaded', () => {
    const localStorageKey = 'quotes';
    const sessionStorageKey = 'lastViewedQuote';
  
    let quotes = JSON.parse(localStorage.getItem(localStorageKey)) || [
      { text: "Learning coding requires one to be very consistent.", category: "Facts" },
      { text: "I am the greatest enemy towards me failing to graduate at ALX SE.", category: "Reflection" },
      { text: "If others have done it before, nothing is going to stop me.", category: "Inspirational" }
    ];
  
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    const exportButton = document.querySelector('#exportImportButtons button');
    const categoryFilter = document.getElementById('categoryFilter');
    
    function showRandomQuote() {
      const filteredQuotes = getFilteredQuotes();
      if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for the selected category.</p>';
        return;
      }
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const randomQuote = filteredQuotes[randomIndex];
      quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><p><em>${randomQuote.category}</em></p>`;
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(randomQuote));
    }
  
    function populateCategoryFilter() {
      const categories = new Set(quotes.map(quote => quote.category));
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });
    }
  
    function getFilteredQuotes() {
      const selectedCategory = categoryFilter.value;
      return selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    }
  
    function filterQuotes() {
      showRandomQuote();
    }
  
    function createAddQuoteForm() {
      const formContainer = document.createElement('div');
      formContainer.innerHTML = `
        <h2>Add a New Quote</h2>
        <form id="addQuoteForm">
          <label for="quoteText">Quote:</label>
          <input type="text" id="quoteText" name="quoteText" required>
          <label for="quoteCategory">Category:</label>
          <input type="text" id="quoteCategory" name="quoteCategory" required>
          <button type="submit">Add Quote</button>
        </form>
      `;
      document.body.insertBefore(formContainer, document.querySelector('#exportImportButtons'));
  
      const addQuoteForm = document.getElementById('addQuoteForm');
      addQuoteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newQuoteText = document.getElementById('quoteText').value;
        const newQuoteCategory = document.getElementById('quoteCategory').value;
  
        const newQuote = {
          text: newQuoteText,
          category: newQuoteCategory
        };
  
        quotes.push(newQuote);
        localStorage.setItem(localStorageKey, JSON.stringify(quotes));
        addQuoteForm.reset();
        populateCategoryFilter();
      });
    }
  
    function createExportButton() {
      exportButton.textContent = 'Export Quotes';
      exportButton.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  
    function createImportInput() {
      const importInput = document.createElement('input');
      importInput.type = 'file';
      importInput.accept = 'application/json';
      importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const importedQuotes = JSON.parse(e.target.result);
            quotes = quotes.concat(importedQuotes);
            localStorage.setItem(localStorageKey, JSON.stringify(quotes));
            populateCategoryFilter();
          };
          reader.readAsText(file);
        }
      });
      document.body.insertBefore(importInput, document.querySelector('#exportImportButtons'));
    }
  
    function loadLastViewedQuote() {
      const lastViewedQuote = JSON.parse(sessionStorage.getItem(sessionStorageKey));
      if (lastViewedQuote) {
        quoteDisplay.innerHTML = `<p>${lastViewedQuote.text}</p><p><em>${lastViewedQuote.category}</em></p>`;
      }
    }
  
    populateCategoryFilter();
    createAddQuoteForm();
    createExportButton();
    createImportInput();
    loadLastViewedQuote();
    showRandomQuote();
  });
document.addEventListener('DOMContentLoaded', () => {
    const localStorageKey = 'quotes';
    const sessionStorageKey = 'lastViewedQuote';
    const localStorageFilterKey = 'lastSelectedCategory';
    const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; 
  
    let quotes = JSON.parse(localStorage.getItem(localStorageKey)) || [
      { text: "Learning coding requires one to be very consistent.", category: "Facts" },
      { text: "I am the greatest enemy towards me failing to graduate at ALX SE.", category: "Reflection" },
      { text: "If others have done it before, nothing is going to stop me.", category: "Inspirational" }
    ];
  
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    const exportButton = document.querySelector('#exportImportButtons button');
    const categoryFilter = document.getElementById('categoryFilter');
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification';
    document.body.appendChild(notificationContainer);
  
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
  
    function populateCategories() {
      const categories = new Set(quotes.map(quote => quote.category));
      categoryFilter.innerHTML = '<option value="all">All Categories</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });
  
      const lastSelectedCategory = localStorage.getItem(localStorageFilterKey);
      categoryFilter.value = lastSelectedCategory || 'all';
    }
  
    function getFilteredQuotes() {
      const selectedCategory = categoryFilter.value;
      return selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    }
  
    function filterQuotes() {
      showRandomQuote();
      localStorage.setItem(localStorageFilterKey, categoryFilter.value);
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
        populateCategories();
  
        postQuoteToServer(newQuote);
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
      importInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const importedQuotes = JSON.parse(e.target.result);
            quotes = quotes.concat(importedQuotes);
            localStorage.setItem(localStorageKey, JSON.stringify(quotes));
            populateCategories();
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
  
    function showNotification(message) {
      notificationContainer.innerHTML = `<p>${message}</p>`;
      setTimeout(() => {
        notificationContainer.innerHTML = '';
      }, 5000);
    }
  
    async function fetchQuotesFromServer() {
      try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();

        const localQuotesMap = new Map(quotes.map(q => [q.text, q]));
        let hasConflict = false;
  
        serverQuotes.forEach(serverQuote => {
          const localQuote = localQuotesMap.get(serverQuote.title);
          if (localQuote) {
          
            if (serverQuote.body !== localQuote.text) {
              hasConflict = true;
              Object.assign(localQuote, { text: serverQuote.body });
            }
          } else {
            quotes.push({ text: serverQuote.body, category: "Uncategorized" });
          }
        });
  
        if (hasConflict) {
          showNotification('Conflicts resolved with server data.');
        }
  
        localStorage.setItem(localStorageKey, JSON.stringify(quotes));
        populateCategories();
      } catch (error) {
        showNotification('Error fetching quotes from server.');
      }
    }
  
    async function postQuoteToServer(quote) {
      try {
        await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(quote)
        });
      } catch (error) {
        showNotification('Error posting quote to server.');
      }
    }
  
    async function syncQuotes() {
      try {
       
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        
        const serverQuotesMap = new Map(serverQuotes.map(q => [q.title, q]));
  
        const newQuotes = [];
        let hasConflict = false;
  
        quotes.forEach(localQuote => {
          const serverQuote = serverQuotesMap.get(localQuote.text);
          if (serverQuote) {
            if (serverQuote.body !== localQuote.text) {
              hasConflict = true;
              Object.assign(localQuote, { text: serverQuote.body });
            }
          } else {
            newQuotes.push(localQuote);
          }
        });

        serverQuotes.forEach(serverQuote => {
          if (!quotes.find(q => q.text === serverQuote.title)) {
            newQuotes.push({ text: serverQuote.body, category: "Uncategorized" });
          }
        });
  
        if (hasConflict) {
          showNotification('Conflicts resolved with server data.');
        }
  
        quotes = [...quotes, ...newQuotes];
        localStorage.setItem(localStorageKey, JSON.stringify(quotes));
  
        await Promise.all(newQuotes.map(async quote => {
          await fetch(serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
          });
        }));
  
        populateCategories();
        alert('Quotes synced with server!');
      } catch (error) {
        showNotification('Error syncing quotes with server.');
      }
    }
  
    function setupPeriodicFetching() {
      syncQuotes(); // Initial sync
      setInterval(syncQuotes, 60000);
    }
  
    function setupConflictResolution() {
    
    }
  
    populateCategories();
    createAddQuoteForm();
    createExportButton();
    createImportInput();
    loadLastViewedQuote();
    showRandomQuote();
  
    categoryFilter.addEventListener('change', filterQuotes);
    setupPeriodicFetching();
    setupConflictResolution();
  });
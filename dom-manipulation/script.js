document.addEventListener('DOMContentLoaded', () => {
    const quotes = [
      { text: "Learning coding requires one to be very consistent.", category: "Facts" },
      { text: "I am the greatest enemy towards me failing to graduate at ALX SE.", category: "Reflection" },
      { text: "If others have done it before, nothing is going to stop me.", category: "Inspirational" }
    ];
  
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
  
    function showRandomQuote() {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex];
      quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><p><em>${randomQuote.category}</em></p>`;
    }
  
    newQuoteButton.addEventListener('click', showRandomQuote);
  
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
  
      document.body.appendChild(formContainer);
  
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
        addQuoteForm.reset();
      });
    }
  
    createAddQuoteForm();
    showRandomQuote();
  });
  
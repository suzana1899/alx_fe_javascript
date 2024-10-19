// Manage quotes array and initialize with stored quotes if available
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Motivation",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
];

// Save the quotes array to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `"${randomQuote.text}" - ${randomQuote.category}`;

  // Store the last viewed quote in session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Function to create the "Add Quote" form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Add a new quote and save to local storage
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes(); // Save to local storage
    populateCategories(); // Update category dropdown
    alert("Quote added!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Export quotes as JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories(); // Update category dropdown
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// Populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map((quote) => quote.category))]; // Get unique categories

  // Clear existing options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Load the last selected filter from local storage
  const lastSelectedCategory =
    localStorage.getItem("lastSelectedCategory") || "all";
  categoryFilter.value = lastSelectedCategory;
  filterQuotes(); // Filter quotes based on the last selected category
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteDisplay = document.getElementById("quoteDisplay");

  // Store last selected category in local storage
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  // Clear current quotes display
  quoteDisplay.innerHTML = "";

  // Display quotes based on selected category
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((quote) => quote.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    filteredQuotes.forEach((quote) => {
      quoteDisplay.innerHTML += `"${quote.text}" - ${quote.category}<br>`;
    });
  } else {
    quoteDisplay.innerHTML = "No quotes available for this category.";
  }
}

// Event listener to show a random quote
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Create the "Add Quote" form when the page loads
createAddQuoteForm();
populateCategories(); // Populate categories when the page loads

// end

// Simulated server API URL
const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Example URL

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    // Adjust according to the structure of your data
    return data.map((item) => ({ text: item.title, category: "General" }));
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

// Sync new quotes with local storage
function syncQuotes(newQuotes) {
  const existingQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const mergedQuotes = [...existingQuotes, ...newQuotes];

  // Remove duplicates: keep the server's data in case of conflicts
  const uniqueQuotes = mergedQuotes.reduce((acc, current) => {
    const x = acc.find((item) => item.text === current.text);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc; // Conflict: server data takes precedence
    }
  }, []);

  localStorage.setItem("quotes", JSON.stringify(uniqueQuotes));
  displayQuotes(uniqueQuotes);
  alert("Quotes synced from server!");
}

// Start fetching quotes periodically
function startPeriodicFetching() {
  setInterval(async () => {
    const newQuotes = await fetchQuotesFromServer();
    if (newQuotes) {
      syncQuotes(newQuotes);
    }
  }, 60000); // Check every minute
}

// Display quotes in the DOM
function displayQuotes(quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  quotes.forEach((quote) => {
    const quoteElement = document.createElement("p");
    quoteElement.textContent = `"${quote.text}" - ${quote.category}`;
    quoteDisplay.appendChild(quoteElement);
  });

  // Notify about sync
  if (quotes.length > 0) {
    alert("Displayed quotes are updated from the local storage.");
  }
}

// Start fetching when the document loads
document.addEventListener("DOMContentLoaded", () => {
  const quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  displayQuotes(quotes);
  startPeriodicFetching();
});

/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

// --- Add: Product Search Input ---
const controlsContainer = document.createElement("div");
controlsContainer.style.display = "flex";
controlsContainer.style.flexDirection = "row";
controlsContainer.style.alignItems = "center";
controlsContainer.style.gap = "16px";
controlsContainer.style.marginBottom = "16px";

// Product search input for filtering by name/keyword
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.id = "productSearch";
searchInput.placeholder = "Search products...";
searchInput.style.padding = "8px";
searchInput.style.fontSize = "1rem";
searchInput.style.flex = "1";
controlsContainer.appendChild(searchInput);

// Insert controls above productsContainer
productsContainer.parentNode.insertBefore(controlsContainer, productsContainer);

// Track RTL mode
let isRTL = false;

// Lists of RTL and LTR languages
const rtlLangs = [
  "ar",
  "he",
  "fa",
  "ur",
  "ps",
  "dv",
  "yi",
  "syr",
  "sam",
  "nqo",
  "ckb",
  "sd",
  "ug",
  "ku",
  "az-Arab",
  "pa-Arab",
  "ks",
  "bal-Arab",
  "lrc",
  "mzn",
  "hmd",
  "khw",
  "bgn",
  "prs",
  "uz-Arab",
];
const ltrLangs = [
  "en",
  "fr",
  "es",
  "de",
  "it",
  "pt",
  "ru",
  "zh",
  "ja",
  "ko",
  "tr",
  "pl",
  "nl",
  "sv",
  "no",
  "da",
  "fi",
  "el",
  "hu",
  "cs",
  "ro",
  "sk",
  "bg",
  "uk",
  "sr",
  "hr",
  "lt",
  "lv",
  "et",
  "sl",
  "mt",
  "ga",
  "sq",
  "mk",
  "is",
  "th",
  "vi",
  "id",
  "ms",
  "tl",
  "sw",
  "zu",
  "xh",
  "af",
  "eu",
  "ca",
  "gl",
  "cy",
  "bs",
  "be",
  "az",
  "ka",
  "hy",
  "mn",
  "kk",
  "ky",
  "tg",
  "tk",
  "uz",
  "mo",
  "lb",
  "fo",
  "fa-Latn",
];

// Function to set direction based on language
function setDirectionByLanguage(lang) {
  if (rtlLangs.some((rtl) => lang.startsWith(rtl))) {
    isRTL = true;
    document.body.dir = "rtl";
  } else {
    isRTL = false;
    document.body.dir = "ltr";
  }
  // Update direction for product grid, selected products, chat window
  productsContainer.dir = isRTL ? "rtl" : "ltr";
  const selectedList = document.getElementById("selectedProductsList");
  if (selectedList) selectedList.dir = isRTL ? "rtl" : "ltr";
  chatWindow.dir = isRTL ? "rtl" : "ltr";
}

// Detect language on page load and set direction
const userLang = navigator.language || navigator.userLanguage || "";
setDirectionByLanguage(userLang);

// Store last loaded products for search filtering
let lastLoadedProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
// Track selected products
let selectedProducts = [];

// Display product cards and allow selection
function displayProducts(products) {
  // Apply RTL direction to grid
  productsContainer.dir = isRTL ? "rtl" : "ltr";
  productsContainer.innerHTML = products
    .map((product) => {
      // Check if product is selected
      const isSelected = selectedProducts.some((p) => p.id === product.id);
      return `
      <div class="product-card${isSelected ? " selected" : ""}" data-id="${
        product.id
      }" tabindex="0" aria-label="${product.name} card${
        isSelected ? ", selected" : ""
      }" style="direction:${isRTL ? "rtl" : "ltr"};">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
        </div>
      </div>
    `;
    })
    .join("");

  // Add click event listeners for selection
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.getAttribute("data-id"));
      toggleProductSelection(id, products);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const id = Number(card.getAttribute("data-id"));
        toggleProductSelection(id, products);
      }
    });
  });
}

// Toggle product selection
function toggleProductSelection(id, products) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const alreadySelected = selectedProducts.some((p) => p.id === id);
  if (alreadySelected) {
    selectedProducts = selectedProducts.filter((p) => p.id !== id);
  } else {
    selectedProducts.push(product);
  }
  displayProducts(products);
  updateSelectedProductsList();
}

// Helper: Save selected products to localStorage
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

// Helper: Load selected products from localStorage
function loadSelectedProductsFromStorage() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    try {
      selectedProducts = JSON.parse(saved);
    } catch {
      selectedProducts = [];
    }
  }
}

// Add Clear All button for selected products
function addClearAllButton() {
  let list = document.getElementById("selectedProductsList");
  if (!list) return;
  let clearBtn = document.getElementById("clearSelectedBtn");
  if (!clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.id = "clearSelectedBtn";
    clearBtn.textContent = "Clear All";
    clearBtn.style.margin = "8px 0";
    clearBtn.onclick = () => {
      selectedProducts = [];
      saveSelectedProducts();
      updateSelectedProductsList();
    };
    list.insertAdjacentElement("beforebegin", clearBtn);
  }
  clearBtn.style.display =
    selectedProducts.length > 0 ? "inline-block" : "none";
}

// Show selected products below the grid
function updateSelectedProductsList() {
  let list = document.getElementById("selectedProductsList");
  if (!list) {
    // Create the container if it doesn't exist
    list = document.createElement("div");
    list.id = "selectedProductsList";
    productsContainer.insertAdjacentElement("afterend", list);
  }
  // Apply RTL direction to selected products list
  list.dir = isRTL ? "rtl" : "ltr";
  // Get the Generate Routine button by id
  const generateRoutineBtn = document.getElementById("generateRoutine");
  if (selectedProducts.length === 0) {
    list.innerHTML = `<div class="placeholder-message">No products selected</div>`;
    addClearAllButton();
    // Hide Generate Routine button if present
    if (generateRoutineBtn) {
      generateRoutineBtn.style.display = "none";
    }
    return;
  }
  list.innerHTML = selectedProducts
    .map(
      (product) => `
        <div class="selected-product-item" aria-label="Selected: ${product.name}">
          <img src="${product.image}" alt="${product.name}" width="40" height="40">
          <span>${product.name}</span>
          <button class="remove-selected" aria-label="Remove ${product.name}" data-id="${product.id}">&times;</button>
        </div>
      `
    )
    .join("");

  // Add remove event listeners
  const removeBtns = document.querySelectorAll(".remove-selected");
  removeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      selectedProducts = selectedProducts.filter((p) => p.id !== id);
      saveSelectedProducts();
      updateSelectedProductsList();
      // Also update grid selection
      loadProducts().then((products) => {
        const filteredProducts = products.filter(
          (product) => product.category === categoryFilter.value
        );
        displayProducts(filteredProducts);
      });
    });
  });
  addClearAllButton();
  saveSelectedProducts();

  // Show Generate Routine button if present
  if (generateRoutineBtn) {
    generateRoutineBtn.style.display = "inline-block";
    // Remove previous event listeners to avoid duplicates
    generateRoutineBtn.replaceWith(generateRoutineBtn.cloneNode(true));
    const newBtn = document.getElementById("generateRoutine");
    newBtn.addEventListener("click", async () => {
      // Only use selected products
      if (selectedProducts.length === 0) {
        chatWindow.innerHTML = `<div class="placeholder-message">Please select products to generate a routine.</div>`;
        return;
      }
      // Prepare product data for AI (send ALL product fields)
      const productData = selectedProducts.map((product) => ({
        ...product, // include all fields
      }));
      // Add initial user message to conversation history
      conversationMessages = [
        {
          role: "system",
          content:
            "You are a helpful assistant that only answers questions about L'Oréal products, skincare, haircare, makeup, fragrance, and beauty routines. Only answer questions related to these topics.",
        },
        {
          role: "user",
          content: `Here are the selected products: ${JSON.stringify(
            productData,
            null,
            2
          )}\n\nPlease generate a personalized beauty routine using only these products. Reply with a numbered step-by-step routine, and for each step, explain which product to use, the order, and why.`,
        },
      ];
      // Show a styled loading message with emojis and formatting
      chatWindow.innerHTML = `
        <div style="
          background: #f8f9fa;
          border-radius: 32px;
          padding: 80px 48px;
          margin: 48px 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          text-align: center;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        ">
          <div style="font-size: 3.2rem; margin-bottom: 28px;">✨ Let's Generate Your Routine! ✨</div>
          <div style="font-size: 2rem; margin-bottom: 24px;">Sit tight while we create your personalized beauty routine.</div>
          <div style="font-size: 2.8rem; margin-bottom: 24px;">💄🧴🧖‍♀️</div>
          <div style="font-size: 1.3rem; color: #888;">This may take a few seconds...</div>
        </div>
      `;
      try {
        // Send request to Cloudflare Worker endpoint
        const response = await fetch(
          "https://project8-worker.nhailes.workers.dev/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: conversationMessages }),
          }
        );
        const data = await response.json();
        // Check for AI response
        if (
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content
        ) {
          // Add AI response to conversation history
          conversationMessages.push({
            role: "assistant",
            content: data.choices[0].message.content,
          });

          // --- BEGIN: Stylize and summarize AI response for students ---
          // Get the AI's response text
          const aiText = data.choices[0].message.content;

          // Try to extract recommended routine steps and explanations
          let summaryHtml = "";
          // If response contains numbered steps, show them as a list
          if (aiText.match(/\n\d+\./)) {
            // Find where the first step starts
            const stepMatch = aiText.match(/\n\d+\./);
            const stepIndex = stepMatch ? aiText.indexOf(stepMatch[0]) : -1;
            let introText = "";
            let stepsText = aiText;
            if (stepIndex > 0) {
              introText = aiText.substring(0, stepIndex).trim();
              stepsText = aiText.substring(stepIndex);
            }
            // Split steps
            const steps = stepsText
              .split(/\n\d+\.\s?/)
              .filter((s) => s.trim() !== "");
            if (introText) {
              summaryHtml += `<div style="font-size:1.15rem; margin-bottom:12px;">${introText}</div>`;
            }
            // For each step, check if it mentions a selected product and show its image
            summaryHtml += steps
              .slice(0, 5) // show up to 5 steps for brevity
              .map((step, i) => {
                let imgHtml = "";
                selectedProducts.forEach((product) => {
                  // Check if product name is mentioned in the step (case-insensitive)
                  if (step.toLowerCase().includes(product.name.toLowerCase())) {
                    imgHtml = `<img src="${product.image}" alt="${product.name}" style="height:40px; vertical-align:middle; margin-right:8px; border-radius:8px;">`;
                  }
                });
                return `<li><strong>Step ${
                  i + 1
                }:</strong> ${imgHtml}${step.trim()}</li>`;
              })
              .join("");
            summaryHtml = `<div>${summaryHtml}</div>`;
            summaryHtml = summaryHtml.replace(
              /(<div[^>]*>.*?<\/div>)(.*)/s,
              `$1<ol style="text-align:left; font-size:1.15rem; margin:0 0 12px 0;">$2</ol>`
            );
          } else if (aiText.includes("\n-")) {
            // If response contains bullet points, show only first 5
            const bullets = aiText.split("\n-").slice(1, 6);
            summaryHtml = bullets.map((b) => `<li>${b.trim()}</li>`).join("");
            summaryHtml = `<ul style="text-align:left; font-size:1.15rem; margin:0 0 12px 0;">${summaryHtml}</ul>`;
          } else {
            // Otherwise, show only the first paragraph
            const firstParagraph = aiText.split("\n\n")[0];
            summaryHtml = `<div style="font-size:1.15rem; margin-bottom:12px;">${firstParagraph}</div>`;
          }

          // Display the stylized summary card with recommendations
          chatWindow.innerHTML = `
            <div style="
              background: #fffbea;
              border-radius: 18px;
              padding: 36px 28px;
              margin: 36px auto;
              box-shadow: 0 4px 18px rgba(0,0,0,0.10);
              max-width: 700px;
              text-align: left;
              border: 1px solid #ffe58f;
            ">
              <div style="font-size:2rem; font-weight:600; margin-bottom:18px; color:#d48806;">
                🌟 Your Personalized Routine
              </div>
              ${summaryHtml}
              <div style="font-size:1rem; color:#888; margin-top:18px;">
                For more details, ask a follow-up question below!
              </div>
            </div>
          `;
          // --- END: Stylize and summarize AI response ---
        } else {
          chatWindow.innerHTML = `<div class="error-message">Sorry, no routine was generated. Please try again.</div>`;
        }
      } catch (error) {
        chatWindow.innerHTML = `<div class="error-message">Error generating routine. Please check your connection and try again.</div>`;
      }
    });
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  lastLoadedProducts = products;
  const selectedCategory = e.target.value;
  // Filter by category
  let filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );
  // Also filter by search input value
  const searchValue = searchInput.value.trim().toLowerCase();
  if (searchValue) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchValue) ||
        (product.description &&
          product.description.toLowerCase().includes(searchValue))
    );
  }
  displayProducts(filteredProducts);
  updateSelectedProductsList();
});

// --- Add: Search input event listener ---
searchInput.addEventListener("input", () => {
  // Filter products by category and search value
  const selectedCategory = categoryFilter.value;
  let filteredProducts = lastLoadedProducts;
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }
  const searchValue = searchInput.value.trim().toLowerCase();
  if (searchValue) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchValue) ||
        (product.description &&
          product.description.toLowerCase().includes(searchValue))
    );
  }
  displayProducts(filteredProducts);
  updateSelectedProductsList();
});
// --- End Add ---

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = chatForm.querySelector("input, textarea").value.trim();
  if (!userInput) return;

  // Add user's follow-up question to conversation history
  conversationMessages.push({ role: "user", content: userInput });

  // Show loading message
  chatWindow.innerHTML += `<div class="placeholder-message">Thinking...</div>`;

  try {
    // Send request to Cloudflare Worker endpoint
    const response = await fetch(
      "https://project8-worker.nhailes.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversationMessages }),
      }
    );
    const data = await response.json();
    // Check for AI response
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      // Add AI response to conversation history
      conversationMessages.push({
        role: "assistant",
        content: data.choices[0].message.content,
      });
      // Display the full chat history
      chatWindow.dir = isRTL ? "rtl" : "ltr"; // Apply RTL to chat window
      chatWindow.innerHTML = conversationMessages
        .filter((msg) => msg.role !== "system")
        .map((msg) =>
          msg.role === "user"
            ? `<div class="user-message">${msg.content}</div>`
            : `<div class="ai-response">${msg.content}</div>`
        )
        .join("");
    } else {
      chatWindow.innerHTML += `<div class="error-message">Sorry, no answer was generated. Please try again.</div>`;
    }
  } catch (error) {
    chatWindow.innerHTML += `<div class="error-message">Error generating answer. Please check your connection and try again.</div>`;
  }
  // Clear input after sending
  chatForm.querySelector("input, textarea").value = "";
});

// On page load, restore selected products from localStorage and products for search
loadProducts().then((products) => {
  lastLoadedProducts = products;
});
loadSelectedProductsFromStorage();
updateSelectedProductsList();
loadSelectedProductsFromStorage();

// Initial selected products list
updateSelectedProductsList();
// Initial selected products list
updateSelectedProductsList();
loadSelectedProductsFromStorage();

// Initial selected products list
updateSelectedProductsList();

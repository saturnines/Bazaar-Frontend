//Debounce use reduce api calls
function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

//Dom tree selection to modify the tree while typing
const resultBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");

let allAvailableItems = []; 

//Calls the first backend api, to get a list of possible items (An error should never happen)
function fetchAllItems() {
    fetch('https://34.68.195.193:8080/dyn_search_list') // Google Cloud IP CHANGES EVERY RS
        .then(response => response.json())
        .then(data => {

            allAvailableItems = data.all_items || [];
        })
        .catch(error => console.error('Failed to fetch items:', error));
}

// Calls the debounce function and gives a delay of 300 ms before calling the api
const debouncedFetchKeywords = debounce(function(input) {

    const filteredItems = input.length ? allAvailableItems.filter(item => 
        item.toLowerCase().includes(input.toLowerCase())) : [];
   
    display(filteredItems);
}, 300); 

inputBox.addEventListener('keyup', () => debouncedFetchKeywords(inputBox.value));

// Displays the results from api, shows the first 6 results
function display(result) {
    const limitedResults = result.slice(0, 6);

    const content = limitedResults.map(item => `<li class="search-item" data-item="${item}">${item}</li>`).join('');
    resultBox.innerHTML = `<ul>${content}</ul>`;
}


//Adds an event listen to look for a click event and then all's the trading algo for fetch results
resultBox.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.search-item')) {
        const itemName = e.target.getAttribute('data-item');
        fetchItemDetails(itemName);
    }
});

//Calls the api to get the searched item then generates html with various info
async function fetchItemDetails(itemName) {
    const response = await fetch(`https://34.68.195.193:8080/items/?search_term=${itemName}`);
    const itemDetails = await response.json();


    resultBox.classList.remove('buy', 'watch', 'no');
    // Apply new class 
    resultBox.classList.add(itemDetails.Signal);

    // Display item details
    resultBox.innerHTML = `
    <div class="item-detail-card">
        <h2>${itemName}</h2>
        <p class="signal ${itemDetails.Signal.toLowerCase()}">Signal: <strong>${itemDetails.Signal.toUpperCase()}</strong></p>
        <div class="metrics">
            <p><i class="fas fa-shopping-cart"></i> Medium Buy from Last Week: <strong>${itemDetails.metrics.medium_buy.toFixed(2)}</strong></p>
            <p><i class="fas fa-tag"></i> Instant buy currently: <strong>${itemDetails.metrics.current_price.toFixed(2)}</strong></p>
            <p><i class="fas fa-money-bill-wave"></i> Medium Sell from Last week: <strong>${itemDetails.metrics.medium_sell.toFixed(2)}</strong></p>
            <p><i class="fas fa-hand-holding-usd"></i> Instant Sell currently: <strong>${itemDetails.metrics.instant_sell.toFixed(2)}</strong></p>
            <p><i class="fa-solid fa-note"></i> Please note, I am not responsible for inaccuracies of this. </strong></p>
        </div>
    </div>
`;
}


fetchAllItems();


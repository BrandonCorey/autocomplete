const Autocomplete = {
  wrapInput: function() {
    let wrapper = document.createElement('div');
    wrapper.classList.add('autocomplete-wrapper');
    this.input.parentNode.appendChild(wrapper); // Put wrapper onto DOM at same level as input
    wrapper.appendChild(this.input); // Move input to inside of wrapper
  },

  createUI: function() {
    let listUI = document.createElement('ul');
    listUI.classList.add('autocomplete-ui');
    this.input.parentNode.appendChild(listUI); // Put on same level as input node
    this.listUI = listUI; // store reference on Autocomplete

    let overlay = document.createElement('div');
    overlay.classList.add('autocomplete-overlay');
    overlay.style.width = `${this.input.clientWidth}px`;

    this.input.parentNode.appendChild(overlay); // Put overlay elemnt on same level as input and ul
    this.overlay = overlay; // Store reference to it
  },

  bindEvents: function() {
    this.input.addEventListener('input', this.valueChanged.bind(this))
  },

  valueChanged: function() {
    let value = this.input.value; // value entered into box (built in property for inputs/textareas)

    if (value.length > 0) {
      this.fetchMatches(value, matches => {
        this.visible = true;
        this.matches = matches;
        this.bestMatchIdx = 0; // Use first match in matches array as overlay word
        this.draw()
      })
    } else {
      this.reset()
    }
  },

  fetchMatches: function(query, callback) {
    let request = new XMLHttpRequest();

    request.addEventListener('load', event => {
      callback(request.response);
    });

    request.open('GET', `${this.url}${encodeURIComponent(query)}`);
    console.log(`${this.url}${encodeURIComponent(query)}`)
    request.responseType = 'json' // coerces JSON to JavaScript object
    request.send();
  },

  draw: function() {
    while (this.listUI.lastChild) {
      this.listUI.removeChild(this.listUI.lastChild);
    }

    if (!this.visible) {
      this.overlay.textContent = '';
      return;
    }

    if (this.bestMatchIdx !== null && this.matches.length !== 0) {
      let selected = this.matches[this.bestMatchIdx];
      console.log(selected.name)
      this.overlay.textContent = this.generateOverlayContent(this.input.value, selected.name)
    } else {
      this.overlay.textContent = '';
    }

    this.matches.forEach(match => {
      let li = document.createElement('li');
      li.classList.add('autocomplete-ui-choice');

      li.textContent = match.name;
      this.listUI.appendChild(li);
    });
  },

  
  generateOverlayContent: function(value, match) {
    let restOfStr = match.slice(value.length);
    return value + restOfStr;
  },

  reset: function() {
    this.visible = false;
    this.matches = [];
    this.bestMatchIdx = null;

    this.draw();
  },

  init: function() {
    this.input = document.querySelector('input'); // initalize init instance prop
    this.url = '/countries?matching='; // initialize url instance prop

    this.listUI = null; // initialize listUI instance prop
    this.overlay = null; // initialize overlay instance prop
  
    this.wrapInput(); // Create a wrapper with autocomplete-wrapper class, puts it around input element
    this.createUI(); // Store reference to listUI and overlay, put them onto DOM underneath input (all inside wrapper)
    this.bindEvents(); // If there is text input, fetch matches from server, initalize a visible property = true, save reference to array of matches, draw dropdown

    this.reset(); // set visible and matches properties to initial values
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Autocomplete.init();
});
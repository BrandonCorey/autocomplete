import debounce from './debounce.js'

class Autocomplete {
  constructor(input, url) {
    this.input = input // initalize input instance prop
    this.url = url; // initialize url instance prop

    this.listUI = null; // initialize listUI instance prop
    this.overlay = null; // initialize overlay instance prop
  
    this.wrapInput(); // Create a wrapper with autocomplete-wrapper class, puts it around input element
    this.createUI(); // Store reference to listUI and overlay, put them onto DOM underneath input (all inside wrapper)

    this.valueChanged = debounce(this.valueChanged.bind(this), 300); // Retuns new version of valueChanged that executes after 300ms of no input in text input field

    this.bindEvents(); // If there is text input, fetch matches from server, initalize a visible property = true, save reference to array of matches, render dropdown
    this.reset(); // set visible and matches properties to initial values
  }

  wrapInput() {
    let wrapper = document.createElement('div');
    wrapper.classList.add('autocomplete-wrapper');
    this.input.parentNode.appendChild(wrapper); // Put wrapper onto DOM at same level as input
    wrapper.appendChild(this.input); // Move input to inside of wrapper
  }

  createUI() {
    let listUI = document.createElement('ul');
    listUI.classList.add('autocomplete-ui');
    this.input.parentNode.appendChild(listUI); // Put on same level as input node
    this.listUI = listUI; // store reference on Autocomplete

    let overlay = document.createElement('div');
    overlay.classList.add('autocomplete-overlay');
    overlay.style.width = `${this.input.clientWidth}px`;

    this.input.parentNode.appendChild(overlay); // Put overlay elemnt on same level as input and listUI
    this.overlay = overlay; // Store reference to it
  }

  bindEvents() {
    this.input.addEventListener('input', this.valueChanged); // This one gets reassigned to debounced return value later
    this.input.addEventListener('keydown', this.handleKeydown.bind(this)); // We bind to Autocomplete since valueChanged context would have been `this.input`
    this.listUI.addEventListener('click', this.handleMouseClick.bind(this)); // Same for this one
  }

  handleMouseClick(event) {
    let matchElement = event.target;

    this.input.value = matchElement.textContent;
    this.reset();
  }

  handleKeydown(event) {
    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.selectedIdx === null) {
          this.selectedIdx = 0;
        } else if (this.selectedIdx === this.matches.length - 1) {
          this.selectedIdx = null;
          this.input.value = this.previousValue
        } else {
          this.selectedIdx += 1;
        }

        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.selectedIdx === null) {
          this.selectedIdx = this.matches.length - 1;
        } else if (this.selectedIdx === 0) {
          this.selectedIdx = null;
          this.input.value = this.previousValue
        } else {
          this.selectedIdx -= 1;
        }
        break;

      case 'Tab':
        event.preventDefault();
        if (this.bestMatchIdx !== null && this.matches.length !== 0) {
          this.input.value = this.matches[this.bestMatchIdx].name
        }

      case 'Enter':
        this.reset();
        break;

      case 'Escape':
        this.reset();
        break;
    }
      this.bestMatchIdx = null;
      this.render();
  }

  valueChanged() {
    let value = this.input.value; // value entered into box (built in property for inputs/textareas)
    this.previousValue = value;

    if (value.length > 0) {
      this.fetchMatches(value, matches => {
        this.visible = true;
        this.matches = matches;
        this.bestMatchIdx = 0; // Use first match in matches array as overlay word
        this.selectedIdx = null;

        this.render()
      })
    } else {
      this.reset()
    }
  }

  fetchMatches(query, callback) {
    let request = new XMLHttpRequest();

    request.addEventListener('load', event => {
      callback(request.response);
    });

    request.open('GET', `${this.url}${encodeURIComponent(query)}`);
    request.responseType = 'json' // coerces JSON to JavaScript object
    request.send();
  }

  render() {
    while (this.listUI.lastChild) {
      this.listUI.removeChild(this.listUI.lastChild);
    }

    if (!this.visible) {
      this.overlay.textContent = '';
      return;
    }

    if (this.bestMatchIdx !== null && this.matches.length !== 0) {
      let selected = this.matches[this.bestMatchIdx];
      this.overlay.textContent = this.generateOverlayContent(this.input.value, selected.name)
    } else {
      this.overlay.textContent = '';
    }


    this.matches.forEach((match, matchIdx) => {
      let li = document.createElement('li');
      li.classList.add('autocomplete-ui-choice');
  
      if (this.isSelected(matchIdx)) {
        li.classList.add('selected');
        this.input.value = match.name;
      }

      li.textContent = match.name;
      this.listUI.appendChild(li);
    });

  }

  isSelected(matchIdx) {
    return this.selectedIdx === matchIdx;
  }
  
  generateOverlayContent(value, match) {
    let restOfStr = match.slice(value.length);
    return value + restOfStr;
  }

  reset() {
    this.visible = false;
    this.matches = [];
    this.bestMatchIdx = null;
    this.selectedIdx = null;
    this.preventValue = null;

    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const url = '/countries?matching=';
  let input = document.querySelector('input');
  new Autocomplete(input, url);
});
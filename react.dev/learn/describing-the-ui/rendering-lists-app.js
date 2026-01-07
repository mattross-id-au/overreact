import { people } from './data.js';
import { getImageUrl } from './utils.js';

customElements.define('scientist-list', class extends HTMLElement {
    connectedCallback() {
        const listItems = people.map(person => `
          <li key="${person.id}">
            <img
              src=${getImageUrl(person)}
              alt=${person.name}
            />
            <p>
              <b>${person.name}:</b>
              ${' ' + person.profession + ' '}
              known for ${person.accomplishment}
            </p>
          </li>`
        ).join('');
        this.innerHTML = `
          <article>
            <h1>Scientists</h1>
            <ul>${listItems}</ul>
          </article>
        `
    }
})
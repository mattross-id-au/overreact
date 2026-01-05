import { getImageUrl } from './utils.js'

customElements.define('person-profile', class extends HTMLElement {
  connectedCallback() {

    this.innerHTML = `
      <profile-card>
        <profile-avatar size='${100}'></profile-avatar>
      </profile-card>
    `;

    // No need to pass data in Props/Attributes.
    // It can be set directly on the Element object
    this.querySelector('profile-avatar').setPerson({
        name: 'Katsuko Saruhashi',
        imageId: 'YfeOqp2'
    });

  }
});

customElements.define('profile-avatar', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <img
        class="avatar"
        width="${this.getAttribute("size")}"
        height="${this.getAttribute("size")}"
      />
    `;
  }

  setPerson(person) {
    this.querySelector("img").setAttribute("alt", person.name);
    this.querySelector("img").setAttribute("src", getImageUrl(person));
  }
});

customElements.define('profile-card', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <div class="card">
            ${this.innerHTML}
        </div>
    `;
  }
});
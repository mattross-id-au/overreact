const user = {
  name: 'Hedy Lamarr',
  imageUrl: 'https://i.imgur.com/yXOvdOSs.jpg',
  imageSize: 90,
};

customElements.define('person-profile', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>${user.name}</h1>
      <img
        class="avatar"
        src="${user.imageUrl}"
        alt="${'Photo of ' + user.name}"
        style="width: ${user.imageSize}px; height: ${user.imageSize}px"
      />
    `;
  }
});
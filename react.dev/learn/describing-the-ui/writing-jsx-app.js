customElements.define('todo-list', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <!-- This is fine in Web Components -->
      <h1>Hedy Lamarr's Todos</h1>
      <img
        src="https://i.imgur.com/yXOvdOSs.jpg"
        alt="Hedy Lamarr"
        class="photo"
      >
      <ul>
        <li>Invent new traffic lights
        <li>Rehearse a movie scene
        <li>Improve spectrum technology
      </ul>
    `;
  }
});

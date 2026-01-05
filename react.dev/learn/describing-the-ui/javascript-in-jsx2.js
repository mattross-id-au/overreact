const person = {
  name: 'Gregorio Y. Zara',
  theme: {
    'background-color': 'black',
    'color': 'pink'
  }
};

customElements.define('todo-list', class extends HTMLElement {
  connectedCallback() {

    const style = Object.entries(person.theme)
        .map(([attribute, value]) => 
            `${attribute}:${value}`
        ).join(";");

    this.innerHTML = `
      <div style="${ style }"><!-- Theme applied dynamically below -->
        <h1>${person.name}'s Todos</h1>
        <img
          className="avatar"
          src="https://i.imgur.com/7vQD0fPs.jpg"
          alt="Gregorio Y. Zara"
        />
        <ul>
          <li>Improve the videophone</li>
          <li>Prepare aeronautics lectures</li>
          <li>Work on the alcohol-fuelled engine</li>
        </ul>
      </div>
    `;
    
    // Apply theme
    //Object.assign(this.querySelector("div").style, person.theme);
  }
});

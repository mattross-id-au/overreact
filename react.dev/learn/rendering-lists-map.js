const listItems = products.map(product => `
  <li data-id="${product.id}">
    ${product.title}
  </li>
`).join('');

return `
  <ul>${listItems}</ul>
`;
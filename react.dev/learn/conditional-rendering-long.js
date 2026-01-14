let content;
if (isLoggedIn) {
  content = '<admin-panel></admin-panel>';
} else {
  content = '<login-form></login-form>';
}
this.innerHTML = `
  <div>
    ${content}
  </div>
`;
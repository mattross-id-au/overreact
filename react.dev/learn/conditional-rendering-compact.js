`<div>
  ${isLoggedIn ? `
    <admin-panel></admin-panel>
  ` : `
    <login-form></login-form>
  `}
</div>`
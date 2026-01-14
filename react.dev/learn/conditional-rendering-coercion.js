// if isLoggedIn = false, then it will render <div>false</div>
<div>
  ${isLoggedIn && `<admin-panel></admin-panel>`}
</div>
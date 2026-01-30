import { useState, useEffect } from 'react';

// Always run every time you need to re-render
export default function ExampleComponent() {

  const [count, setCount] = useState(0);

  // ... except this. Only run this sometimes.
  // It's special. Don't worry about it.
  // If you need to know, there are more blog posts about this
  // than just about any other JavaScript or React topic.
  // Defends of this code smell have been chugging the Kool-Aid.
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
import * as stylex from '@stylexjs/stylex';

// No token imports at all — the drift case.
const styles = stylex.create({
  box: {
    color: '#333333',            // literal · color
    backgroundColor: '#eeeeee',  // literal · color
    padding: '12px',             // literal · space
    margin: '0',                 // neutral · zero
    zIndex: 10,                  // literal · layer
    opacity: 0.5,                // untokenizable
    transitionDuration: '150ms', // literal · motion
  },
});

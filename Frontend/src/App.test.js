// Test file for the App component, using Jest and React Testing Library to verify that specific elements render as expected.

// Import necessary utilities from React Testing Library and the component to be tested.
import { render, screen } from '@testing-library/react';
import App from './App';

// Define a test case to check if the "learn react" link is rendered by the App component.
test('renders learn react link', () => {
  render(<App />); // Render the App component in a test environment.

  // Attempt to find an element with the text "learn react" and assert that it's present in the document.
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

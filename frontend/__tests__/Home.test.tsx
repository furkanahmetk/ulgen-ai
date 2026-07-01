import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/app/page';

describe('Sentinel AI Home Page', () => {
    it('should render the cspr.click connect button', () => {
        render(<Home />);
        const button = screen.getByText('[Connect cspr.click]');
        expect(button).toBeInTheDocument();
    });

    it('should have a target URL input and select dropdown', () => {
        render(<Home />);
        const input = screen.getByPlaceholderText('https://...');
        expect(input).toBeInTheDocument();
        
        const optionDeFi = screen.getByText('DeFi Protocol');
        expect(optionDeFi).toBeInTheDocument();
    });

    it('should show INITIATE DUE DILIGENCE button', () => {
        render(<Home />);
        const button = screen.getByText('INITIATE DUE DILIGENCE');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled(); // Disabled when URL is empty
    });
});

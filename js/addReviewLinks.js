let grid_buttons = document.querySelectorAll('[class$="-grid"] button');

grid_buttons.forEach((button) => {
    button.addEventListener('click', () => {
        window.location.href = 'review.html';
    });
});
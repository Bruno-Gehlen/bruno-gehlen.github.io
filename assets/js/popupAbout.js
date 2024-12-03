// Selecionar todos os botões e pop-ups
const buttons = document.querySelectorAll('.trigger');
const popups = document.querySelectorAll('.popup');
const closeButtons = document.querySelectorAll('.close');

// Função para abrir o pop-up correspondente
buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        popups[index].style.display = 'flex'; // Mostra o pop-up correspondente
    });
});

// Função para fechar o pop-up ao clicar no botão de fechar
closeButtons.forEach((close, index) => {
    close.addEventListener('click', () => {
        popups[index].style.display = 'none'; // Esconde o pop-up correspondente
    });
});

// Fechar o pop-up ao clicar fora do conteúdo
popups.forEach((popup) => {
    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none'; // Esconde o pop-up
        }
    });
});

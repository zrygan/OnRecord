document.querySelectorAll('.song-heart-select').forEach(item => {
    item.addEventListener('click', event => {
        const heart = item.querySelector('.song-heart');
        if (heart.src.includes('heart-select-gray.svg')) {
        heart.src = '../svg/home/heart-select-pink.svg';
        } else {
        heart.src = '../svg/home/heart-select-gray.svg';
        }
    });
});
document.addEventListener('DOMContentLoaded', async () => {
    const username = await getCurrentUsername(); // Fetch the current user's username
    console.log('Current username:', username);

    const songBoxes = document.querySelectorAll('.song-box');
    const promises = Array.from(songBoxes).map(async (songBox) => {
        const songId = songBox.getAttribute('data-id'); // Assuming each song-box has a data-id attribute with the song's ID
        console.log('Processing song with ID:', songId);

        const likes = await getSongLikes(songId); // Fetch the likes for the song
        console.log('Likes for song', songId, ':', likes);

        if (likes.includes(username)) {
            const heart = songBox.querySelector('.song-heart');
            heart.src = '../svg/home/heart-select-pink.svg';
            console.log('Set heart to pink for song', songId);
        }

        const heartNumber = songBox.querySelector('.song-heart-number');
        heartNumber.textContent = likes.length;

        const reviews = await getSongReviews(songId); // Fetch the reviews for the song
        console.log('Reviews for song', songId, ':', reviews);

        const reviewNumber = songBox.querySelector('.song-review-number');
        reviewNumber.textContent = reviews.length;

        songBox.querySelector('.song-heart-select').addEventListener('click', async event => {
            const heart = event.currentTarget.querySelector('.song-heart');
            if (heart.src.includes('heart-select-gray.svg')) {
                heart.src = '../svg/home/heart-select-pink.svg';
                console.log('Liking song', songId);
                const newLikes = await likeSong(songId, username);
                heartNumber.textContent = newLikes.length;
            } else {
                heart.src = '../svg/home/heart-select-gray.svg';
                console.log('Unliking song', songId);
                const newLikes = await unlikeSong(songId, username);
                heartNumber.textContent = newLikes.length;
            }
        });
    });

    await Promise.all(promises); // Ensure all promises are resolved before proceeding
    console.log('Finished processing all songs');
});

async function getCurrentUsername() {
    try {
        const response = await fetch('/api/current-username');
        if (!response.ok) {
            throw new Error('Failed to fetch current username');
        }
        const data = await response.json();
        return data.username;       
    } catch (error) {
        console.error('Error fetching current username:', error);
        return null;
    }
}

async function getSongLikes(songId) {
    try {
        const response = await fetch(`/api/songs/${songId}/likes`);
        if (!response.ok) {
            throw new Error('Failed to fetch song likes');
        }
        const data = await response.json();
        return data.likes;
    } catch (error) {
        console.error('Error fetching song likes:', error);
        return [];
    }
}

async function getSongReviews(songId) {
    try {
        const response = await fetch(`/api/songs/${songId}/reviews`);
        if (!response.ok) {
            throw new Error('Failed to fetch song reviews');
        }
        const data = await response.json();
        return data.reviews;
    } catch (error) {
        console.error('Error fetching song reviews:', error);
        return [];
    }
}

async function likeSong(songId, username) {
    try {
        const response = await fetch(`/api/songs/${songId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        if (!response.ok) {
            throw new Error('Failed to like song');
        }
        const data = await response.json();
        console.log('Liked song', songId, 'new likes:', data.likes);
        return data.likes;
    } catch (error) {
        console.error('Error liking song:', error);
        return [];
    }
}

async function unlikeSong(songId, username) {
    try {
        const response = await fetch(`/api/songs/${songId}/unlike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        if (!response.ok) {
            throw new Error('Failed to unlike song');
        }
        const data = await response.json();
        console.log('Unliked song', songId, 'new likes:', data.likes);
        return data.likes;
    } catch (error) {
        console.error('Error unliking song:', error);
        return [];
    }
}
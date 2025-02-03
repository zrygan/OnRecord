function showModal(devName) {
    document.getElementById('modal').style.display = 'block';
    if (devName == 'zen') {
        document.getElementById('modal-content').innerHTML = 
        `<span class="modal-title">Hi, I'm Zhean Ganituen</span> <br> <br>
        My favorite album is Daft Punk - Discovery. But, I like anything Daft Punk, 
        Death Grips, and The Strokes! <br> <br>
        My nickname is Zen or zrygan which is my professional handle. <br> <br>
        I like algorithms and CLRS 🙏!
        `;
        
    }
    else if (devName == 'jaz'){
        document.getElementById('modal-content').innerHTML = 
        `<span class="modal-title">Hi, I'm Jaztin Jimenez</span> <br> <br>
        My favorite ✨ musical ✨ is Hamilton - Lin-Manuel Miranda. <br> <br>
        My nickname is Jaz. <br> <br>
        I'm a Theatre Kid in Computer Science.
        `;
    }
    else if (devName == 'mentosberi'){
        document.getElementById('modal-content').innerHTML = 
        `<span class="modal-title">Hi, I'm Yesha Jose</span> <br> <br>
        Favorite album uhhh weezer blue album or persona 4 ost or persona 5 ost! <br> <br>
        My nickname is mentosberi. <br> <br>
        I like persona 4 😃.
        `;
    }
    else if (devName == 'kyle'){
        document.getElementById('modal-content').innerHTML = 
        `<span class="modal-title">Hi, I'm Kyle Loja</span> <br> <br>
        My favorite song is It's Raining After All - ツユ! <br> <br>
        Bio: An aspiring Application Security Engineer who writes progression fantasy.
        `;
    }
    else if (devName == 'bryle'){
        document.getElementById('modal-content').innerHTML = 
        `<span class="modal-title">Hi, I'm Bryle Magura</span> <br> <br>
        Favorite song is Stay with me - miki matsubara <br> <br>
        <i> Just some random dude in ccs </i>
        `;
    }
}

function modal_close() {
    document.getElementById('modal').style.display = 'none';
}

// window.onload = function() {
//     var music = document.getElementById("background-music");
//     music.play();
// };

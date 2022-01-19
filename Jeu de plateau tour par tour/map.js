class Map {
    constructor() {
        this.cells = [];
        this.unavailableCells = [];
        // on definit les deux joueurs
        this.players = [
            new Player(this, 0, "cleopatre", new Weapon("dagger", 10, "images/dagger.svg")),
            new Player(this, 1, "queen", new Weapon("dagger", 10, "images/dagger.svg"))
        ];

        // on definit les 4 armes
        this.weapons = [
            new Weapon('bow', 12, "images/bow.svg"),
            new Weapon('sword', 20, "images/sword.svg"),
            new Weapon('saber', 16, "images/saber.svg"),
            new Weapon('axe', 6, "images/axe.svg")
        ];

        // le joueur en cours est celui qui a l'i 0
        this.currentPlayer = 0;
        //var oldPlayer = this.players[this.currentPlayer];
        this.currentPlayer = this.currentPlayer == 0 ? 1 : 0;

        // On definit le nombre de ligne et de colonne de la map
        this.nbLigne = 10;
        this.nbColonne = 10;
        this.nbCellules = this.nbLigne * this.nbColonne;
        $(".map").css("width", (this.nbColonne * 49.5) + "px");

        //On définit le nombre d'obstacle sur la map
        this.nbObstacles = 10;

        this.generate();
    }

    generate() {

        // on genere le nombre de cellules sur la map 
        // let nbCellules = this.nbLigne * this.nbColonne;
        for (let i = 0; i < this.nbCellules; i++) {
            $(".map").append("<div>" + "</div>");
            this.cells.push(i);
            // console.log("nbCellules")
        }

        /* on genere les obstacles sur la map*/
        let nbObstacle = this.nbObstacles;
        for (let i = 0; i < nbObstacle; i++) {

            // on applique la methode "randomCell()" à chaque obstacle
            let random = this.randomCell(i);
            // on applique la class CSS "unavailableCells" aux obstacles
            $(".map > div").eq(random).addClass("unavailableCells");
            //On les ajoute les index des obstacles dans le tableau des cellules à éviter 
            this.unavailableCells.push(random);
            // on applique la methode "rebuild()" à chaque obstacle, rebuil() definit les limites cellules a choisir
            this.rebuild(random);

        }

        this.players.forEach(function (player, i) {
            /* on applique la methode "randomCell()" afin de choisir 2 
            joueurs aléatoire et les placé dans les parties top et bottom de la map*/
            let random = this.randomCell(i);

            // on applique la class Css "player" à chaque joueur en fonction de son id
            $(".map > div").eq(random).addClass("player-" + player.id);
            /* on applique la methode "rebuild()" à chaque joueur pour ne pas les choisir dans la meme cellules
            rebuil() definit les limites cellules a choisir
            */
            this.rebuild(random);
            // la position de chaque joueur est égale aux deux nombre aléatoire definit par la méthode "ramdomCell"
            player.position = random;
        }, this);

        this.weapons.forEach(function (weapon, i) {
            /* on applique la methode "randomCell()" afin de choisir 4 
            armes aléatoires et les placé dans les parties top et bottom de la map*/
            let random = this.randomCell(i);
            // on definit une image pour chaque armes
            $(".map > div").eq(random).css("background-image", "url(" + weapon.visual + ")");
            // on applique la methode "rebuild()" à chaque armes pour ne pas les choisir dans la meme cellules
            this.rebuild(random);
            // la position de chaque armes est égale aux deux nombre aléatoire definit par la méthode "randomCell"
            // je n'est pas compris cette partie car par defaut la position dune arme est nulle
            weapon.position = random;
        }, this);

        /*on applique la méthode "prepare()" au joueur en cours,
        la méthode "prepare()" defini les cellules de deplacement des joueurs*/

        this.players[this.currentPlayer].prepare();


    }


    /* on definit les intervalles pour ne pas choisir plusieurs fois la meme cellule
    le choix de la sellule suivante se fait en partant de la cellule qui a l'indix 0,
    jusqu'a l'index de la cellules deja selectionnée et de l'index +1 la celulles deja selectionnée
    jusqu'a la cellule d'index 99   */
    rebuild(cell) {

        var index = this.cells.indexOf(cell);
        let start = this.cells.slice(0, index);
        let end = this.cells.slice(index + 1);
        this.cells = start.concat(end);

    }

    /* lorsque l'index d'une cellules est inferieur à 50, on met la celulle dans le tabeau top
       sinon on la met dans le tabeau bottom
       cela nous permet de bien repartir les joueurs et les armes sur la map
       */
    randomCell(index) {
        var limite = this.nbLigne;
        var top = [];
        var bottom = [];
        this.cells.forEach(function (cell) {
            if (cell <= limite) {
                top.push(cell);
            } else {
                bottom.push(cell);
            }
        });
        // si l'index de la cellule est paire, on prend un nombre aléatoire dans le tableau top 
        if (index % 2 > 0) {
            return top[Math.floor(Math.random() * top.length)];
        }
        // sinon on prend un nombre aléatoire dans le tableau bottom 
        return bottom[Math.floor(Math.random() * bottom.length)];
    }

    next() {
        // document.getElementById("playerOHp").innerHTML = this.hp;
        // document.getElementById("player1Hp").innerHTML = this.map.players[this.id == 0 ? 1 : 0].hp;
        /* si l'id du joueur en cours est égale à 0, alors le joueur suivant est celui qui a pour id 1
        sinon si l'id du joueur en cours est 1, alors le joueur suivant est celui qui a pour id 0
        */
        var oldPlayer = this.players[this.currentPlayer];
        this.currentPlayer = this.currentPlayer == 0 ? 1 : 0;

        /* si les positions des deux joueurs ne se touche pas,
        on applique la méthode "prepare()" au joueur en cours
        la méthode "prepare()" definit les cellules le deplacement des joueurs
        */
        if (
            this.players[this.currentPlayer].position - this.nbColonne !== oldPlayer.position
            && this.players[this.currentPlayer].position + this.nbColonne !== oldPlayer.position
            && this.players[this.currentPlayer].position - 1 !== oldPlayer.position
            && this.players[this.currentPlayer].position + 1 !== oldPlayer.position
        ) {
            this.players[this.currentPlayer].prepare();
        } else {

            /* si les points de vie du joueur adverse <=0, 
                        on affiche du message de défaite dans la div qui à pour id "result" */
            if (this.players[this.currentPlayer].hp <= 0) {
                $('#playerName').hide(1000);
                document.getElementById("result").innerHTML = this.players[this.currentPlayer].name + " a perdue.";

                // on désactive les boutons attack et defend
                $("#attack, #defend").prop("disabled", true);
            } else {
                // Afficher les bouton Attaquer et se Défendre
                $("#attack, #defend").removeAttr("disabled")
                // si les positions des deux joueurs se touche, on applique la méthode "fight()" au joueur en cours
                this.players[this.currentPlayer].fight();
            }

        }
    }

}

new Map();

// Classe Player

class Player {
    constructor(map, id, name, weapon) {
        this.map = map;
        this.id = id;
        this.name = name;
        this.weapon = weapon;
        this.hp = 100;
        this.defense = false;
        this.position = null;
        this.move = this.move.bind(this);
        this.attackOrDefend = this.attackOrDefend.bind(this);
        this.reloadHp();
        this.reloadWeapon();
    }

    reloadWeapon() {
        $("#player" + this.id + "Weapon").text(this.weapon.name);
        $("#player" + this.id + "WeaponDamage").text(this.weapon.damage);
    }

    reloadHp() {
        $("#player" + this.id + "Hp").text(this.hp);
    }

    // Chaque joueur est sensé se déplacer sur trois cases
    // la méthode "prepare()" defini le deplacement des joueurs
    prepare() {

        /* Pour récuperer la position du joueur adverse
        si l'id du joueur en cours est égale à 0, l'id du joueur adverse sera 1 
        sinon si l'id du joueur en cours est égale à 1, l'id du joueur adverse sera 0 */
        let opponentPlayer = this.map.players[this.id == 0 ? 1 : 0].position;

        for (let pad = 1; pad <= 3; pad++) {
            let line = this.position % this.map.nbColonne;
            /* Si la position du joueur adverse n'est pas sur les cellules de déplacement du joueur en cours
             et les cellules de déplacement du joueur en cours ne 
             font pas partir des zones a évités(les 10 obstacles)
            et */

            if ((this.position + pad) != opponentPlayer && this.map.unavailableCells.indexOf(this.position + pad) == -1 && (line + pad) <= this.map.nbColonne - 1) {
                $(".map > div").eq(this.position + pad).addClass("moveCell");
            }
            else {
                break;
            }
        }

        for (let pad = 1; pad <= 3; pad++) {
            let line = this.position % this.map.nbColonne;
            if ((this.position - pad) != opponentPlayer && this.map.unavailableCells.indexOf(this.position - pad) == -1 && (line - pad) >= 0) {
                $(".map > div").eq(this.position - pad).addClass("moveCell");
            }
            else {
                break;
            }
        }

        // déplacement vers le bas

        for (let pad = this.map.nbColonne; pad <= 3 * this.map.nbColonne; pad += this.map.nbColonne) {
            if ((this.position + pad) != opponentPlayer && this.map.unavailableCells.indexOf(this.position + pad) == -1 && (this.position + pad) <= this.map.nbCellules) {
                $(".map > div").eq(this.position + pad).addClass("moveCell");
            }
            else {
                break;
            }
        }

        // deplacement vers le haut

        for (let pad = this.map.nbColonne; pad <= 3 * this.map.nbColonne; pad += this.map.nbColonne) {
            if ((this.position - pad) != opponentPlayer && this.map.unavailableCells.indexOf(this.position - pad) == -1 && (this.position - pad) >= 0) {
                $(".map > div").eq(this.position - pad).addClass("moveCell");
            }
            else {
                break;
            }
        }
        $("body").one("click", ".moveCell", this.move);

    }

    fight() {
        // on affiche le nom du joueur qui doit attqué ou se défendre 
        document.getElementById("playerName").innerHTML = this.name + " a vous de jouer ";

        // on applique la class CSS "fighter" au joueur en cours
        $(".map > div").eq(this.position).addClass("fighter");

        /*lorsqu'on clique sur "attack" ou "defend", c'est méthodes s'applique au joueur en cours.
         ces evenements se déclenche une seule fois */
        $("body").one("click", ".fight", this.attackOrDefend);

    }

    attackOrDefend(e) {
        console.log(this.hp);
        console.log(this.weapon.damage);
        //console.log(this.hp);
        if ($(e.currentTarget).attr("id") == "attack") {
            /* si l'id du joueur en cours est égale à 0, l'id du joueur adverse sera 1 
        sinon si l'id du joueur en cours est égale à 1, l'id du joueur adverse sera 0 */
            var opponent = this.id == 0 ? 1 : 0;
            // players est définit dans la class Map, il faut toujours le recuper dans cette class
            var opponentPlayer = this.map.players[opponent];
            this.defense = false;
            //console.log(opponentPlayer, this);
            /* si le joueur adverse se défend, l'attaque du joueur en cours lui inflige des dégats qui sont 
             équivalent à la moitier de la puissance de l'arme du joueur en cours 
             sinon ces dégats sont équivalent à la puissance de l'arme du joueur en cours */
            if (opponentPlayer.defense) {
                this.map.players[opponent].hp -= this.weapon.damage / 2;
            }
            else {
                this.map.players[opponent].hp -= this.weapon.damage;
            }
            // Afichage du hp
            this.map.players[opponent].reloadHp();
            //console.log(this.map.players[opponent].hp, this.map.players[opponent].name);
            /* si les points de vie du joueur adverse <=0, 
            on affiche du message de défaite dans la div qui à pour id "result" */
            // if (this.map.players[opponent].hp <= 0) {
            //     document.getElementById("result").innerHTML = this.map.players[opponent].name + " a perdue, " + this.name + " est la nouvelle princesse du royaume";
            //     // on désactive les boutons attack et defend
            //     $("#attack, #defend").prop("disabled", true);
            // }
        } else {
            this.defense = true;
        }
        // Pour passer au joueur adverse
        this.map.next();
        // on retir la class CSS fighter du joueur précedent
        $(".map > div").eq(this.position).removeClass("fighter");


    }


    move(e) {
        // on retir la class CSS "moveCell" de la map
        $(".map > div").removeClass("moveCell");
        // on retir la class CSS "player" de chaque joueur, en fonction de son id
        $(".map > div").removeClass("player-" + this.id);
        // on applique la class CSS "player" au joueur en cours, en fonction de son id
        this.position = $(e.currentTarget).index();
        $(".map > div").eq(this.position).addClass("player-" + this.id);
        //$("body").off("click", ".moveCell", this.move);

        // La position d'une arme par defaut est nulle
        var weapon = this.map.weapons.map(function (weapon) {
            return weapon.position;
        }).indexOf(this.position)
        if (weapon > -1) {
            // l'arme temporaire = l'arme par défaut du joueur en cours
            var tempWeapon = this.weapon;
            //console.log(this.weapon)
            // Le joueur en cours recupere une arme sur la map
            this.weapon = this.map.weapons[weapon];
            // l'arme que le joueur en cours vient de récuperer est remplacée par l'arme par défaut du joueur en cours
            this.map.weapons[weapon] = tempWeapon;
            // l'arme que le joueur en cours vient de récuperer à pour nouvelle position la position du jour en cours
            // à la base une arme n'a pas de position 
            this.map.weapons[weapon].position = this.position;
            /* on remplace l'image de l'arme que le joueur
             en cours vient de récuperer par l'image de l'arme par défaut qu'il avait*/
            $(".map>div").eq(this.map.weapons[weapon].position).css("background-image", "url(" + this.map.weapons[weapon].visual + ")");
            // Affichage de l'arme du joueur
            this.reloadWeapon();
        }
        // on passe au joueur suivant
        this.map.next();

    }

}